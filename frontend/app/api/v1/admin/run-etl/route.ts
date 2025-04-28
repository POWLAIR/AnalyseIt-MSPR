import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Cette route appelle l'API backend pour exécuter le processus ETL
export async function POST(request: NextRequest) {
  try {
    // Récupération des paramètres de requête
    const searchParams = request.nextUrl.searchParams;
    const reset = searchParams.get('reset') || 'false';
    
    // Appel à l'API backend
    // Attention : en environnement Docker, utilisez le hostname du service backend, pas localhost
    const backendUrl = 'process.env.NEXT_PUBLIC_API_URL';
    console.log(`Tentative de connexion au backend à l'URL: ${backendUrl}`);
    
    const response = await fetch(`${backendUrl}/api/v1/admin/run-etl?reset=${reset}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Données chargées avec succès! Processus ETL complété.'
    });
  } catch (error) {
    console.error('Erreur lors de l\'exécution du processus ETL:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur lors du chargement des données'
      },
      { status: 500 }
    );
  }
} 