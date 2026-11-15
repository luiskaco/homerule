import { describe, expect, it } from 'vitest';
import { CATALOG, CATALOG_BY_ID } from './index';
import { LAYERS } from '../domain/layers';
import { PROJECT_TYPES } from '../domain/project-types';

const layerIds = new Set(LAYERS.map((l) => l.id));
const typeIds = new Set(PROJECT_TYPES.map((p) => p.id));
const allProvided = new Set(CATALOG.flatMap((t) => t.provides));

describe('integridad del catálogo', () => {
  it('no repite ids', () => {
    expect(CATALOG_BY_ID.size).toBe(CATALOG.length);
  });

  it('cada tecnología pertenece a una capa y a tipos de proyecto que existen', () => {
    for (const t of CATALOG) {
      expect(layerIds.has(t.layer), `${t.id}: capa ${t.layer}`).toBe(true);
      if (t.types !== 'all') {
        for (const type of t.types) expect(typeIds.has(type), `${t.id}: tipo ${type}`).toBe(true);
      }
      for (const type of t.bestFor) expect(typeIds.has(type), `${t.id}: bestFor ${type}`).toBe(true);
    }
  });

  it('todo lo que se necesita lo aporta alguna tecnología', () => {
    for (const t of CATALOG) {
      for (const need of t.needs) {
        const options = Array.isArray(need) ? need : [need];
        expect(
          options.some((o) => allProvided.has(o)),
          `${t.id} necesita ${options.join(' o ')} y nadie lo aporta`,
        ).toBe(true);
      }
    }
  });

  it('los choques apuntan a tecnologías que existen', () => {
    for (const t of CATALOG) {
      for (const id of t.conflicts) expect(CATALOG_BY_ID.has(id), `${t.id} choca con ${id}`).toBe(true);
    }
  });

  it('una tecnología verificada dice contra qué, y una sin verificar no', () => {
    for (const t of CATALOG) {
      if (t.verifiedAt) {
        expect(t.verifiedAt, t.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(t.source.length, `${t.id}: falta la fuente`).toBeGreaterThan(0);
      } else {
        expect(t.source, `${t.id}: tiene fuente pero no fecha`).toBe('');
      }
    }
  });

  it('cada capa tiene al menos una tecnología', () => {
    for (const layer of LAYERS) {
      expect(
        CATALOG.some((t) => t.layer === layer.id),
        `capa ${layer.id} vacía`,
      ).toBe(true);
    }
  });
});
