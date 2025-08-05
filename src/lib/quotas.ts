// lib/quotas.ts

type ModelQuota = {
    rpm: number; // requêtes par minute
    rpd: number; // requêtes par jour
    tpm: number; // tokens par minute
    tpd: number; // tokens par jour
  };
  
  type Usage = {
    timestamp: number;
    requests: number;
    tokens: number;
  };
  
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
    // ... ajoute les autres ici
  };
  
  const usageStore: Record<string, Usage[]> = {};
  
  export function recordUsage(userId: string, modelId: string, tokens: number) {
    const key = `${userId}:${modelId}`;
    const now = Date.now();
    if (!usageStore[key]) usageStore[key] = [];
  
    usageStore[key].push({ timestamp: now, requests: 1, tokens });
    usageStore[key] = usageStore[key].filter((u) => now - u.timestamp < 24 * 60 * 60 * 1000);
  }
  
  export function checkQuota(
    userId: string,
    modelId: string
  ): { ok: boolean; reason?: string } {
    const key = `${userId}:${modelId}`;
    const now = Date.now();
    const usage = usageStore[key] || [];
  
    const last1Min = now - 60 * 1000;
    const last24h = now - 24 * 60 * 60 * 1000;
  
    const recent1Min = usage.filter((u) => u.timestamp > last1Min);
    const recent24h = usage.filter((u) => u.timestamp > last24h);
  
    const limits = MODEL_LIMITS[modelId] || MODEL_LIMITS['llama-3.1-8b-instant'];
  
    const r1 = recent1Min.reduce((a, b) => a + b.requests, 0);
    const r2 = recent24h.reduce((a, b) => a + b.requests, 0);
    const t1 = recent1Min.reduce((a, b) => a + b.tokens, 0);
    const t2 = recent24h.reduce((a, b) => a + b.tokens, 0);
  
    if (r1 >= limits.rpm) return { ok: false, reason: 'Rate limit: RPM exceeded' };
    if (r2 >= limits.rpd) return { ok: false, reason: 'Rate limit: RPD exceeded' };
    if (t1 >= limits.tpm) return { ok: false, reason: 'Token limit: TPM exceeded' };
    if (t2 >= limits.tpd) return { ok: false, reason: 'Token limit: TPD exceeded' };
  
    return { ok: true };
  }
  
  export function getQuota(userId: string, modelId: string) {
    const key = `${userId}:${modelId}`;
    const now = Date.now();
    const usage = usageStore[key] || [];
  
    const last1Min = now - 60 * 1000;
    const last24h = now - 24 * 60 * 60 * 1000;
  
    const recent1Min = usage.filter((u) => u.timestamp > last1Min);
    const recent24h = usage.filter((u) => u.timestamp > last24h);
  
    const limits = MODEL_LIMITS[modelId] || MODEL_LIMITS['llama-3.1-8b-instant'];
  
    const used = {
      rpm: recent1Min.reduce((a, b) => a + b.requests, 0),
      rpd: recent24h.reduce((a, b) => a + b.requests, 0),
      tpm: recent1Min.reduce((a, b) => a + b.tokens, 0),
      tpd: recent24h.reduce((a, b) => a + b.tokens, 0),
    };
  
    return {
      model: modelId,
      limits,
      used,
      ok: checkQuota(userId, modelId).ok,
    };
  }
  
  // Bonus : pour afficher les quotas de tous les modèles d’un utilisateur
  export function getAllQuotas(userId: string) {
    const result: Record<string, ReturnType<typeof getQuota>> = {};
    for (const modelId of Object.keys(MODEL_LIMITS)) {
      result[modelId] = getQuota(userId, modelId);
    }
    return result;
  }
  