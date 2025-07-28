import { NextRequest } from 'next/server';
import { runAgentWorkflow } from '@/lib/supervisor';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Log dans la console pour l'historique terminal
    console.log('📩 Message reçu:', message);

    // Exécuter le workflow des agents
    const result = await runAgentWorkflow(message);

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
