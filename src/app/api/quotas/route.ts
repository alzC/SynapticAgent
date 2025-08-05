// app/api/quotas/route.ts
import { NextRequest } from 'next/server';
import { getQuota, getAllQuotas } from '@/lib/db/quotas';
import { auth } from '../../../../auth';

// Retiré Edge Runtime pour compatibilité avec postgres
// export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'utilisateur authentifié
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ 
        error: 'Non authentifié',
        reason: 'Veuillez vous connecter pour voir vos quotas'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId');
    const userId = session.user.id;

    const data = modelId 
      ? await getQuota(userId, modelId) 
      : await getAllQuotas(userId);
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erreur API quotas:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
