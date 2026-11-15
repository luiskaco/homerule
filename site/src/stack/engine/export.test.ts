import { describe, expect, it } from 'vitest';
import type { ProjectAnswers } from '../domain/types';
import { evaluateSelection } from './assemble';
import {
  buildAgentsBlock,
  buildDecisionRecord,
  buildManualAgentsBlock,
  buildManualDecisionRecord,
  unverifiedManualNames,
  unverifiedNames,
} from './export';
import { recommend } from './recommend';

const answers: ProjectAnswers = {
  type: 'saas',
  seo: 'none',
  realtime: false,
  needsUsers: true,
  needsPayments: true,
  needsFiles: false,
  needsEmail: false,
  needsAI: false,
  hosting: 'any',
  budget: 'low',
  scale: 'product',
};

describe('exportación', () => {
  const rec = recommend(answers);

  it('el bloque de AGENTS.md lista cada capa elegida y avisa lo que no está verificado', () => {
    const block = buildAgentsBlock(rec, '2026-11-08');
    expect(block).toContain('## Proyecto — Stack');
    expect(block).toContain('| Frontend | React + Vite (SPA) |');
    expect(block).toContain('Sin verificar contra documentación vigente');
    expect(block).not.toContain('| Frontend | React + Vite (SPA) (sin verificar)');
  });

  it('no deja pasar un | dentro de una celda', () => {
    const block = buildAgentsBlock(rec, '2026-11-08');
    for (const row of block.split('\n').filter((l) => l.startsWith('| ') && !l.includes('---'))) {
      expect(row.replaceAll('\\|', '').split('|').length).toBe(5);
    }
  });

  it('el registro de decisión incluye alternativas y descartes con su motivo', () => {
    const adr = buildDecisionRecord(rec, '2026-11-08');
    expect(adr).toContain('**Alternativas consideradas:**');
    expect(adr).toContain('**Descartadas por incompatibilidad:**');
    expect(adr).toMatch(/- .+ · .+: .+/);
  });

  it('unverifiedNames deja afuera lo verificado', () => {
    expect(unverifiedNames(rec)).not.toContain('React + Vite (SPA)');
    expect(unverifiedNames(rec).length).toBeGreaterThan(0);
  });
});

describe('exportación de un stack armado a mano', () => {
  const evaluation = evaluateSelection({
    frontend: 'react-vite',
    backend: 'fastapi',
    ui: null,
    database: 'postgres',
    orm: 'drizzle',
  });

  it('el bloque dice que lo armó la persona y lista las capas elegidas', () => {
    const block = buildManualAgentsBlock(evaluation, '2026-11-08');
    expect(block).toContain('## Proyecto — Stack');
    expect(block).toContain('Armado a mano');
    expect(block).toContain('| Frontend | React + Vite (SPA) |');
    expect(block).toContain('| Backend | Python + FastAPI |');
    expect(block).not.toContain('| UI y estilos |');
  });

  it('los avisos sin resolver salen en el bloque y en el ADR, con capa y tecnología', () => {
    const block = buildManualAgentsBlock(evaluation, '2026-11-08');
    expect(block).toContain('### Avisos sin resolver');
    expect(block).toMatch(/- ORM \/ acceso a datos · .+: Necesita js-runtime/);
    const adr = buildManualDecisionRecord(evaluation, '2026-11-08');
    expect(adr).toContain('**Avisos aceptados:**');
    expect(adr).toMatch(/Necesita js-runtime/);
  });

  it('un aviso informativo se marca como tal', () => {
    expect(buildManualAgentsBlock(evaluation, '2026-11-08')).toContain('(informativo)');
  });

  it('el ADR distingue "no uso nada" de lo que quedó sin elegir', () => {
    const adr = buildManualDecisionRecord(evaluation, '2026-11-08');
    expect(adr).toContain('- **UI y estilos:** no se usa nada.');
    expect(adr).not.toContain('Autenticación');
    expect(adr).toContain('Stack armado a mano por la persona');
  });

  it('sin avisos no inventa la sección', () => {
    const clean = evaluateSelection({ frontend: 'react-vite', backend: 'express' });
    expect(buildManualAgentsBlock(clean, '2026-11-08')).not.toContain('Avisos sin resolver');
    expect(buildManualDecisionRecord(clean, '2026-11-08')).toContain('- Ninguno.');
  });

  it('incluye las condiciones del proyecto si se las pasa', () => {
    const block = buildManualAgentsBlock(evaluation, '2026-11-08', answers);
    expect(block).toContain('Condiciones del proyecto:');
    expect(buildManualDecisionRecord(evaluation, '2026-11-08', answers)).toContain('- Tipo:');
  });

  it('no deja pasar un | dentro de una celda', () => {
    const block = buildManualAgentsBlock(evaluation, '2026-11-08');
    for (const row of block.split('\n').filter((l) => l.startsWith('| ') && !l.includes('---'))) {
      expect(row.replaceAll('\\|', '').split('|').length).toBe(5);
    }
  });

  it('unverifiedManualNames deja afuera lo verificado', () => {
    expect(unverifiedManualNames(evaluation)).not.toContain('React + Vite (SPA)');
  });
});
