// lib/db/quotas.ts - Version persistante avec Drizzle

import { db } from './index';
import { usageLogs, users } from './schema';
import { eq, and, gte, sql } from 'drizzle-orm';

type ModelQuota = {
  rpm: number; // requêtes par minute
  rpd: number; // requêtes par jour  
  tpm: number; // tokens par minute
  tpd: number; // tokens par jour
};

// Limites par modèle (reprises du système en mémoire)
const MODEL_LIMITS: Record<string, ModelQuota> = {
  'allam-2-7b': { rpm: 30, rpd: 7000, tpm: 6000, tpd: 500000 },
  'compound-beta': { rpm: 15, rpd: 200, tpm: 70000, tpd: -1 },
  'compound-beta-mini': { rpm: 15, rpd: 200, tpm: 70000, tpd: -1 },
  'deepseek-r1-distill-llama-70b': { rpm: 30, rpd: 1000, tpm: 6000, tpd: 100000 },
  'gemma2-9b-it': { rpm: 30, rpd: 14400, tpm: 15000, tpd: 500000 },
  'llama-3.1-8b-instant': { rpm: 30, rpd: 14400, tpm: 6000, tpd: 500000 },
  'llama-3.3-70b-versatile': { rpm: 30, rpd: 1000, tpm: 12000, tpd: 100000 },
  'llama3-70b-8192': { rpm: 30, rpd: 14400, tpm: 6000, tpd: 500000 },
  'llama3-8b-8192': { rpm: 30, rpd: 14400, tpm: 6000, tpd: 500000 },
  'meta-llama/llama-4-maverick-17b-128e-instruct': { rpm: 30, rpd: 1000, tpm: 6000, tpd: 500000 },
  'meta-llama/llama-4-scout-17b-16e-instruct': { rpm: 30, rpd: 1000, tpm: 30000, tpd: 500000 },
  'meta-llama/llama-guard-4-12b': { rpm: 30, rpd: 14400, tpm: 15000, tpd: 500000 },
  'meta-llama/llama-prompt-guard-2-22m': { rpm: 30, rpd: 14400, tpm: 15000, tpd: 500000 },
  'meta-llama/llama-prompt-guard-2-86m': { rpm: 30, rpd: 14400, tpm: 15000, tpd: 500000 },
  'mistral-saba-24b': { rpm: 30, rpd: 1000, tpm: 6000, tpd: 500000 },
  'moonshotai/kimi-k2-instruct': { rpm: 60, rpd: 1000, tpm: 10000, tpd: 300000 },
  'qwen/qwen3-32b': { rpm: 60, rpd: 1000, tpm: 6000, tpd: 500000 },
};

/**
 * Enregistre l'usage dans la base de données
 */
export async function recordUsage(
  userId: string, 
  modelId: string, 
  tokens: number,
  agentUsed?: string,
  endpoint = '/api/chat',
  success = true
) {
  try {
    await db.insert(usageLogs).values({
      userId,
      modelId,
      tokensUsed: tokens,
      requestCount: 1,
      agentUsed,
      endpoint,
      success,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement d\'usage:', error);
    // En cas d'erreur DB, on continue (ne pas bloquer l'utilisateur)
  }
}

/**
 * Vérifie les quotas depuis la base de données
 */
export async function checkQuota(
  userId: string,
  modelId: string
): Promise<{ ok: boolean; reason?: string }> {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Récupérer les usages récents
    const [rpm, rpd, tpm, tpd] = await Promise.all([
      // Requêtes par minute
      db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneMinuteAgo),
            eq(usageLogs.success, true)
          )
        ),
      
      // Requêtes par jour
      db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneDayAgo),
            eq(usageLogs.success, true)
          )
        ),
      
      // Tokens par minute
      db
        .select({ total: sql<number>`coalesce(sum(${usageLogs.tokensUsed}), 0)`.as('total') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneMinuteAgo),
            eq(usageLogs.success, true)
          )
        ),
      
      // Tokens par jour
      db
        .select({ total: sql<number>`coalesce(sum(${usageLogs.tokensUsed}), 0)`.as('total') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneDayAgo),
            eq(usageLogs.success, true)
          )
        ),
    ]);

    const limits = MODEL_LIMITS[modelId] || MODEL_LIMITS['llama-3.1-8b-instant'];
    
    const usage = {
      rpm: rpm[0]?.count || 0,
      rpd: rpd[0]?.count || 0,
      tpm: tpm[0]?.total || 0,
      tpd: tpd[0]?.total || 0,
    };

    // Vérifier les limites
    if (usage.rpm >= limits.rpm) {
      return { ok: false, reason: 'Rate limit: RPM exceeded' };
    }
    if (usage.rpd >= limits.rpd) {
      return { ok: false, reason: 'Rate limit: RPD exceeded' };
    }
    if (usage.tpm >= limits.tpm) {
      return { ok: false, reason: 'Token limit: TPM exceeded' };
    }
    if (limits.tpd !== -1 && usage.tpd >= limits.tpd) {
      return { ok: false, reason: 'Token limit: TPD exceeded' };
    }

    return { ok: true };
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des quotas:', error);
    // En cas d'erreur DB, on autorise (fail-safe)
    return { ok: true };
  }
}

/**
 * Récupère les quotas détaillés pour un modèle
 */
export async function getQuota(userId: string, modelId: string) {
  try {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Récupérer les usages récents
    const [rpm, rpd, tpm, tpd] = await Promise.all([
      // Requêtes par minute
      db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneMinuteAgo),
            eq(usageLogs.success, true)
          )
        ),
      
      // Requêtes par jour
      db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneDayAgo),
            eq(usageLogs.success, true)
          )
        ),
      
      // Tokens par minute
      db
        .select({ total: sql<number>`coalesce(sum(${usageLogs.tokensUsed}), 0)`.as('total') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneMinuteAgo),
            eq(usageLogs.success, true)
          )
        ),
      
      // Tokens par jour
      db
        .select({ total: sql<number>`coalesce(sum(${usageLogs.tokensUsed}), 0)`.as('total') })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.modelId, modelId),
            gte(usageLogs.createdAt, oneDayAgo),
            eq(usageLogs.success, true)
          )
        ),
    ]);

    const limits = MODEL_LIMITS[modelId] || MODEL_LIMITS['llama-3.1-8b-instant'];
    
    const used = {
      rpm: rpm[0]?.count || 0,
      rpd: rpd[0]?.count || 0,
      tpm: tpm[0]?.total || 0,
      tpd: tpd[0]?.total || 0,
    };

    const quotaCheck = await checkQuota(userId, modelId);

    return {
      model: modelId,
      limits,
      used,
      ok: quotaCheck.ok,
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des quotas:', error);
    // Fallback en cas d'erreur
    const limits = MODEL_LIMITS[modelId] || MODEL_LIMITS['llama-3.1-8b-instant'];
    return {
      model: modelId,
      limits,
      used: { rpm: 0, rpd: 0, tpm: 0, tpd: 0 },
      ok: true,
    };
  }
}

/**
 * Récupère tous les quotas pour un utilisateur
 */
export async function getAllQuotas(userId: string) {
  const result: Record<string, Awaited<ReturnType<typeof getQuota>>> = {};
  
  // Pour optimiser, on pourrait faire une seule requête agrégée,
  // mais pour l'instant on garde la logique simple
  for (const modelId of Object.keys(MODEL_LIMITS)) {
    result[modelId] = await getQuota(userId, modelId);
  }
  
  return result;
}

/**
 * Nettoie les anciens logs d'usage (tâche de maintenance)
 */
export async function cleanupOldUsageLogs(retentionDays = 30) {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await db
      .delete(usageLogs)
      .where(gte(usageLogs.createdAt, cutoffDate));
    
    console.log(`🧹 Nettoyage des logs: ${result.rowCount} entrées supprimées`);
    return result.rowCount;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des logs:', error);
    return 0;
  }
}