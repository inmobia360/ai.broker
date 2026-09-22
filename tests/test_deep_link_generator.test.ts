import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DeepLinkGenerator } from '../src/lib/geo/deepLinkGenerator.ts';
import { ListingCopyGenerator } from '../src/lib/marketing/listingCopyGenerator.ts';

describe('T3: Enlaces Profundos 3D y Generador de Copys para Portales (RF-CMA4, RF-CMA5)', () => {
  test('DeepLinkGenerator genera enlaces parametrizados para Google Earth 3D y Catastro', () => {
    const links = DeepLinkGenerator.generateLinks({
      lat: 40.4312,
      lon: -3.6872,
      cadastralReference: '9872014VK4797B0001TR',
      propertyAddress: 'Calle Serrano 88, Madrid'
    });

    assert.ok(links.googleEarth3D.includes('earth.google.com/web/@40.431200,-3.687200'));
    assert.ok(links.googleMapsSatellite.includes('google.com/maps/@40.431200,-3.687200,19z'));
    assert.ok(links.catastroVisor.includes('refcat=9872014VK4797B0001TR'));
    assert.ok(links.whatsappSnippet.includes('EXPLORACIÓN AÉREA DEL ENTORNO'));
    assert.ok(links.whatsappSnippet.includes('Calle Serrano 88'));
  });

  test('ListingCopyGenerator redacta anuncio con dotaciones de barrio reales en borrador seguro (RF-CMA4, RF-5)', async () => {
    const result = await ListingCopyGenerator.generateListingCopy('agencia-madrid-01', {
      address: 'Calle Serrano 88, Madrid',
      price: 650000,
      builtM2: 105,
      bedrooms: 3,
      bathrooms: 2,
      hasElevator: true,
      hasTerrace: true
    });

    assert.ok(result.headline.includes('Serrano') || result.headline.includes('Salamanca'));
    assert.ok(result.portalDescription.includes('ENTORNO Y COMUNICACIONES EXCEPCIONALES'));
    assert.ok(result.portalDescription.includes('Transporte:'));
    assert.ok(result.socialMediaPost.includes('650.000 €'));
    assert.ok(result.inspectionLinks.googleEarth3D.length > 0);

    // Verificación de guardián de borrador seguro
    assert.strictEqual(result.draft.status, 'draft_pending');
    assert.strictEqual(result.draft.documentType, 'other');
    assert.ok(result.draft.title.includes('Copia Comercial para Portales'));
  });
});
