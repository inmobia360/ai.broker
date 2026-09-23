import { NextRequest, NextResponse } from 'next/server';
import { RealEstateAIEngine } from '@/lib/ai/realEstateAIEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { property, useOllama = true, language = 'es' } = body;

    if (!property || !property.title || !property.price) {
      return NextResponse.json(
        { error: 'Datos de la propiedad incompletos (se requiere título y precio).' },
        { status: 400 }
      );
    }

    const pack = await RealEstateAIEngine.generateMarketingPack(property, {
      useOllama,
      language
    });

    return NextResponse.json({
      ok: true,
      pack
    });
  } catch (err: any) {
    console.error('Error en /api/ai/marketing:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno generando marketing pack.' },
      { status: 500 }
    );
  }
}
