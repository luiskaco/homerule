import { describe, expect, it } from 'vitest';
import { CATALOG } from '../catalog';
import { tech } from '../catalog/define';
import type { ManualSelection, ProjectAnswers } from '../domain/types';
import { evaluateSelection, layerOptions } from './assemble';

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

const kinds = (selection: ManualSelection, answers?: ProjectAnswers) =>
  evaluateSelection(selection, { answers }).warnings.map((w) => w.kind);

describe('armador libre: ninguna combinación se bloquea', () => {
  it('React con Python y CSS puro se acepta tal cual, sin descartar nada', () => {
    const result = evaluateSelection({ frontend: 'react-vite', backend: 'fastapi', ui: 'css-puro' });
    const chosen = result.layers.filter((l) => l.status === 'chosen').map((l) => l.tech?.id);
    expect(chosen).toEqual(['react-vite', 'css-puro', 'fastapi']);
  });

  it('mezclar lenguajes avisa como información, no como problema', () => {
    const { warnings } = evaluateSelection({ frontend: 'react-vite', backend: 'fastapi' });
    const second = warnings.filter((w) => w.kind === 'second-language');
    expect(second.length).toBeGreaterThan(0);
    expect(second.every((w) => w.severity === 'info')).toBe(true);
  });

  it('el mismo lenguaje en front y back no avisa nada de lenguajes', () => {
    expect(kinds({ frontend: 'react-vite', backend: 'express' })).not.toContain('second-language');
  });
});

describe('armador libre: PHP, Laravel y Bootstrap', () => {
  it('React con Laravel, Bootstrap y Pest se arma sin avisos de problema', () => {
    const { warnings } = evaluateSelection({
      frontend: 'react-vite',
      ui: 'bootstrap',
      backend: 'laravel',
      orm: 'builtin-orm',
      auth: 'laravel-auth',
      testing: 'pest',
    });
    expect(warnings.filter((w) => w.severity === 'warning')).toEqual([]);
    expect(warnings.map((w) => w.kind)).toContain('second-language');
  });

  it('el auth de Laravel avisa si el backend no es Laravel', () => {
    const { warnings } = evaluateSelection({ backend: 'django', auth: 'laravel-auth' });
    expect(warnings.find((w) => w.techId === 'laravel-auth')?.message).toContain('laravel');
  });

  it('Pest avisa si no hay nada de PHP, y Bootstrap no exige ningún framework', () => {
    const { warnings } = evaluateSelection({ backend: 'express', ui: 'bootstrap', testing: 'pest' });
    expect(warnings.filter((w) => w.techId === 'pest').map((w) => w.kind)).toContain('missing-need');
    expect(warnings.filter((w) => w.techId === 'bootstrap')).toEqual([]);
  });
});

describe('armador libre: avisos con motivo', () => {
  it('capacidad ausente: Drizzle sin runtime de JavaScript avisa qué falta', () => {
    const { warnings } = evaluateSelection({ backend: 'fastapi', orm: 'drizzle' });
    const missing = warnings.find((w) => w.kind === 'missing-need' && w.techId === 'drizzle');
    expect(missing?.message).toContain('js-runtime');
  });

  it('el requisito se cumple sin importar el orden de las capas', () => {
    // El ORM se elige antes de la base en la selección; igual debe verla.
    const { warnings } = evaluateSelection({ orm: 'drizzle', backend: 'express', database: 'postgres' });
    expect(warnings.filter((w) => w.kind === 'missing-need')).toEqual([]);
  });

  it('choque: avisa desde cualquiera de los dos lados', () => {
    const a = tech({ id: 'a', name: 'A', layer: 'frontend', types: 'all', solves: 'x', conflicts: ['b'] });
    const b = tech({ id: 'b', name: 'B', layer: 'backend', types: 'all', solves: 'x' });
    const { warnings } = evaluateSelection({ frontend: 'a', backend: 'b' }, { catalog: [a, b] });
    const conflicts = warnings.filter((w) => w.kind === 'conflict');
    expect(conflicts.map((w) => w.techId).sort()).toEqual(['a', 'b']);
    expect(conflicts.every((w) => w.severity === 'warning')).toBe(true);
  });

  it('presupuesto: una tecnología de pago avisa cuando el presupuesto es cero', () => {
    const paid = tech({ id: 'paid', name: 'Paga', layer: 'monitoring', types: 'all', solves: 'x', cost: 'paid' });
    const free = { ...BASE, budget: 'free' as const, scale: 'product' as const };
    const withBudget = evaluateSelection({ monitoring: 'paid' }, { catalog: [paid], answers: free });
    expect(withBudget.warnings.map((w) => w.kind)).toContain('budget');
    const flexible = evaluateSelection({ monitoring: 'paid' }, { catalog: [paid], answers: { ...free, budget: 'flexible' } });
    expect(flexible.warnings.map((w) => w.kind)).not.toContain('budget');
  });

  it('respuestas del proyecto: avisa si la tecnología no encaja con el tipo o con una condición', () => {
    const odd = tech({
      id: 'odd',
      name: 'Rara',
      layer: 'frontend',
      types: ['api'],
      solves: 'x',
      excludeWhen: [{ key: 'seo', is: 'critical' }],
    });
    const answers = { ...BASE, seo: 'critical' as const };
    const found = evaluateSelection({ frontend: 'odd' }, { catalog: [odd], answers }).warnings.map((w) => w.kind);
    expect(found).toEqual(expect.arrayContaining(['project-type', 'excluded']));
  });

  it('sin respuestas no inventa avisos de presupuesto ni de tipo de proyecto', () => {
    const found = kinds({ frontend: 'react-vite', backend: 'express' });
    expect(found).not.toContain('budget');
    expect(found).not.toContain('project-type');
  });
});

describe('armador libre: estados de cada capa', () => {
  it('distingue "no uso nada", "sin elegir" y un id que no existe', () => {
    const { layers } = evaluateSelection({ frontend: null, backend: 'no-existe' });
    const status = (id: string) => layers.find((l) => l.layer.id === id)?.status;
    expect(status('frontend')).toBe('none');
    expect(status('ui')).toBe('unset');
    expect(status('backend')).toBe('unknown');
  });

  it('con respuestas, solo evalúa las capas activas del proyecto', () => {
    const ids = evaluateSelection({}, { answers: BASE }).layers.map((l) => l.layer.id);
    expect(ids).not.toContain('auth');
    expect(ids).toContain('backend');
  });

  it('con allLayers evalúa también las capas que el proyecto no necesita', () => {
    const ids = evaluateSelection({ auth: 'laravel-auth' }, { answers: BASE, allLayers: true }).layers.map(
      (l) => l.layer.id,
    );
    expect(ids).toContain('auth');
  });
});

describe('armador libre: opciones de una capa', () => {
  it('lista todas las tecnologías de la capa, sin filtrar', () => {
    const options = layerOptions('backend', { frontend: 'react-vite' });
    const inCatalog = CATALOG.filter((t) => t.layer === 'backend').length;
    expect(options).toHaveLength(inCatalog);
  });

  it('cada opción trae los avisos que tendría frente al resto de la selección', () => {
    const options = layerOptions('orm', { backend: 'fastapi', database: 'postgres' });
    const drizzle = options.find((o) => o.tech.id === 'drizzle');
    const sqlalchemy = options.find((o) => o.tech.id === 'sqlalchemy');
    expect(drizzle?.warnings.map((w) => w.kind)).toContain('missing-need');
    expect(sqlalchemy?.warnings.filter((w) => w.severity === 'warning')).toEqual([]);
  });

  it('no cuenta la elección actual de la capa contra sí misma', () => {
    const options = layerOptions('backend', { backend: 'fastapi' });
    const fastapi = options.find((o) => o.tech.id === 'fastapi');
    expect(fastapi?.warnings).toEqual([]);
  });
});
