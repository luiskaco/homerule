import { describe, expect, it } from 'vitest';
import { tech } from '../catalog/define';
import { PROJECT_TYPES } from '../domain/project-types';
import type { ProjectAnswers, UserProfile } from '../domain/types';
import { recommend, type LayerResult } from './recommend';

const BASE: ProjectAnswers = {
  type: 'saas',
  seo: 'none',
  realtime: false,
  needsUsers: false,
  needsPayments: false,
  needsFiles: false,
  needsEmail: false,
  needsAI: false,
  hosting: 'any',
  budget: 'flexible',
  scale: 'prototype',
};

const answers = (overrides: Partial<ProjectAnswers>): ProjectAnswers => ({ ...BASE, ...overrides });

const pick = (layers: LayerResult[], id: string) => layers.find((l) => l.layer.id === id);
const chosenId = (layers: LayerResult[], id: string) => pick(layers, id)?.chosen?.tech.id;

describe('casos concretos', () => {
  it('landing con SEO crítico, gratis y sin servidor: no usa una SPA y descarta el VPS', () => {
    const { layers } = recommend(answers({ type: 'landing', seo: 'critical', budget: 'free', hosting: 'serverless' }));
    expect(chosenId(layers, 'frontend')).toBe('astro');
    expect(pick(layers, 'frontend')?.discarded.map((d) => d.tech.id)).toContain('react-vite');
    expect(pick(layers, 'deploy')?.discarded.map((d) => d.tech.id)).toContain('vps-docker');
  });

  it('WordPress con tienda: WooCommerce, MySQL y hosting de WordPress', () => {
    const { layers } = recommend(answers({ type: 'wordpress', needsPayments: true, needsUsers: true, budget: 'low' }));
    expect(chosenId(layers, 'cms')).toBe('wordpress-classic');
    expect(chosenId(layers, 'database')).toBe('mysql');
    expect(chosenId(layers, 'payments')).toBe('woocommerce');
    expect(chosenId(layers, 'auth')).toBe('wordpress-users');
  });

  it('app con IA activa la capa de IA aunque no se marque', () => {
    const { layers } = recommend(answers({ type: 'ai-app' }));
    expect(pick(layers, 'ai')).toBeDefined();
    expect(pick(layers, 'ai')?.chosen).not.toBeNull();
  });

  it('una app móvil gratis no queda sin forma de distribuirse', () => {
    const { layers } = recommend(answers({ type: 'mobile', budget: 'free' }));
    expect(chosenId(layers, 'deploy')).toBe('apk-direct');
    expect(pick(layers, 'deploy')?.discarded.map((d) => d.tech.id)).toContain('mobile-stores');
  });

  it('con FastAPI, el ORM es de Python y Drizzle se descarta diciendo por qué', () => {
    const { layers } = recommend(answers({ needsUsers: true }), { pinned: { backend: 'fastapi' } });
    const orm = pick(layers, 'orm');
    expect(orm?.chosen?.tech.id).toBe('sqlalchemy');
    const drizzle = orm?.discarded.find((d) => d.tech.id === 'drizzle');
    expect(drizzle?.why).toContain('js-runtime');
  });

  it('con Django, el ORM integrado queda disponible', () => {
    const { layers } = recommend(answers({ needsUsers: true }), { pinned: { backend: 'django' } });
    const orm = pick(layers, 'orm');
    const ids = [orm?.chosen?.tech.id, ...(orm?.alternatives.map((a) => a.tech.id) ?? [])];
    expect(ids).toContain('builtin-orm');
    expect(chosenId(layers, 'auth')).toBeDefined();
  });

  it('fijar una tecnología incompatible lo dice en vez de elegir otra en silencio', () => {
    const { layers } = recommend(answers({ needsFiles: true, hosting: 'any' }), {
      pinned: { files: 'local-disk', deploy: 'vercel' },
    });
    const deploy = pick(layers, 'deploy');
    expect(deploy?.chosen).toBeNull();
    expect(deploy?.note).toContain('Choca con');
  });

  it('el perfil sube el puntaje de lo que dominás, pero no decide solo', () => {
    const pinned = { frontend: 'nuxt' };
    const base = recommend(answers({ type: 'saas' }), { pinned });
    const profile: UserProfile = { skills: { nuxt: 'master' }, alreadyPaying: [] };
    const withProfile = recommend(answers({ type: 'saas' }), { pinned, profile });

    const before = pick(base.layers, 'frontend')?.chosen?.score;
    const after = pick(withProfile.layers, 'frontend')?.chosen?.score;
    expect(before).toBeDefined();
    expect(after).toBe((before ?? 0) + 3);

    // Dominar Nuxt no alcanza para desplazar a la opción que mejor encaja con un SaaS.
    const free = recommend(answers({ type: 'saas' }), { profile });
    expect(chosenId(free.layers, 'frontend')).toBe('react-vite');
  });

  it('a igual puntaje gana la tecnología verificada, aunque esté después en el catálogo', () => {
    const make = (id: string, verifiedAt: string | null) =>
      tech({ id, name: id, layer: 'frontend', types: 'all', solves: id, verifiedAt, source: verifiedAt ? 'doc' : '' });
    const catalog = [make('sin-verificar', null), make('verificada', '2026-11-08')];
    const { layers } = recommend(answers({ type: 'saas' }), { catalog });
    expect(chosenId(layers, 'frontend')).toBe('verificada');
  });

  it('es determinista', () => {
    const a = answers({ type: 'ecommerce', needsPayments: true, needsUsers: true, seo: 'critical' });
    expect(recommend(a)).toEqual(recommend(a));
  });
});

/** Recorre una grilla amplia de respuestas buscando combinaciones rotas. */
describe('invariantes sobre todas las combinaciones', () => {
  const combos: ProjectAnswers[] = [];
  for (const type of PROJECT_TYPES.map((p) => p.id)) {
    for (const seo of ['none', 'useful', 'critical'] as const) {
      for (const hosting of ['serverless', 'own-server', 'any'] as const) {
        for (const budget of ['free', 'low', 'flexible'] as const) {
          for (const scale of ['prototype', 'product'] as const) {
            for (const all of [false, true]) {
              combos.push({
                type,
                seo,
                hosting,
                budget,
                scale,
                realtime: all,
                needsUsers: all,
                needsPayments: all,
                needsFiles: all,
                needsEmail: all,
                needsAI: all,
              });
            }
          }
        }
      }
    }
  }

  it('cada tecnología elegida tiene sus necesidades cubiertas por las anteriores', () => {
    const problems: string[] = [];
    for (const a of combos) {
      const provided = new Set<string>();
      for (const r of recommend(a).layers) {
        if (!r.chosen) continue;
        for (const need of r.chosen.tech.needs) {
          const options = Array.isArray(need) ? need : [need];
          if (!options.some((o) => provided.has(o))) {
            problems.push(`${a.type}/${r.chosen.tech.id} necesita ${options.join('|')}`);
          }
        }
        for (const c of r.chosen.tech.provides) provided.add(c);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });

  it('nada elegido choca con otra elección, ni rompe una condición del proyecto', () => {
    const problems: string[] = [];
    for (const a of combos) {
      const { layers, answers: normalized } = recommend(a);
      const chosen = layers.flatMap((l) => (l.chosen ? [l.chosen.tech] : []));
      for (const t of chosen) {
        for (const other of chosen) {
          if (t.conflicts.includes(other.id)) problems.push(`${a.type}: ${t.id} choca con ${other.id}`);
        }
        for (const c of t.excludeWhen) {
          if (normalized[c.key] === c.is) problems.push(`${a.type}: ${t.id} viola ${c.key}=${String(c.is)}`);
        }
        if (normalized.budget === 'free' && t.cost === 'paid') problems.push(`${a.type}: ${t.id} es de pago`);
      }
    }
    expect(problems.slice(0, 10)).toEqual([]);
  });

  it('ninguna capa activa queda sin tecnología elegida, salvo que el presupuesto sea cero', () => {
    // Con presupuesto cero hay capas sin opción gratuita (hosting de WordPress, por ejemplo):
    // es un límite real del catálogo y la interfaz tiene que explicarlo.
    const holes = new Map<string, number>();
    for (const a of combos) {
      if (a.budget === 'free') continue;
      for (const r of recommend(a).layers) {
        if (!r.chosen) {
          const key = `${a.type} · ${r.layer.id}`;
          holes.set(key, (holes.get(key) ?? 0) + 1);
        }
      }
    }
    expect([...holes.entries()].slice(0, 20)).toEqual([]);
  });
});
