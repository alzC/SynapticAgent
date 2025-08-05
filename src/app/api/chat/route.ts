import { NextRequest } from 'next/server';
import { runAgentWorkflow } from '@/lib/supervisor';
import { checkQuota, recordUsage } from '@/lib/db/quotas';
import { auth } from '../../../../auth';

// Retiré Edge Runtime pour compatibilité avec postgres
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, forcedAgent } = await req.json();
    
    // Récupérer l'utilisateur authentifié
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ 
        error: 'Non authentifié',
        reason: 'Veuillez vous connecter pour utiliser SynapticAgent'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = session.user.id;
    const modelId = 'meta-llama/llama-4-scout-17b-16e-instruct';

    // Log dans la console pour l'historique terminal
    console.log('📩 Message reçu:', message, 'User:', session.user.email);

    // Vérifier les quotas AVANT l'appel API (async maintenant)
    const quotaCheck = await checkQuota(userId, modelId);
    if (!quotaCheck.ok) {
      console.log('🚫 Quota dépassé:', quotaCheck.reason);
      return new Response(JSON.stringify({ 
        error: 'Quota dépassé',
        reason: quotaCheck.reason,
        quotaExceeded: true
      }), {
        status: 429, // Too Many Requests
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Exécuter le workflow des agents (avec agent forcé si spécifié)
    const result = await runAgentWorkflow(message, forcedAgent);
    
    // Enregistrer l'usage APRÈS l'appel (estimation ~1000 tokens par appel)
    await recordUsage(
      userId, 
      modelId, 
      1000, // tokens estimés
      result.agentName, // agent utilisé
      '/api/chat',
      true // succès
    );

    // Log de la réponse dans la console
    console.log('🤖 Agent:', result.agentName);
    if (result.toolUsed) {
      console.log('🛠 Tool utilisé:', result.toolUsed);
    }
    console.log('📄 Result:', result);
    console.log('💬 Réponse:', result.response);

    /* Version optimisée pour réduire les tokens
    console.log(`🤖 ${result.agentName}${result.toolUsed ? ` > ${result.toolUsed}` : ''}`);
    */

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    /* Logs détaillés pour le développement
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Context:', {
      timestamp: new Date().toISOString(),
      message,
      lastAgent: result?.agentName,
      lastTool: result?.toolUsed
    });
    */

    return new Response(
      JSON.stringify({ 
        error: 'Une erreur est survenue',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
