import { LAYERS } from '@/stack/domain/layers';
import { PROJECT_TYPES } from '@/stack/domain/project-types';
import type { LayerId, ManualSelection, ProjectAnswers, SkillLevel, UserProfile } from '@/stack/domain/types';

// Comodidades por navegador: si el almacenamiento no está disponible, la app funciona igual.

const ANSWERS_KEY = 'stack-chooser:answers:v1';
const PROFILE_KEY = 'stack-chooser:profile:v1';

export const DEFAULT_ANSWERS: ProjectAnswers = {
  type: 'saas',
  seo: 'none',
  realtime: false,
  needsUsers: true,
  needsPayments: false,
  needsFiles: false,
  needsEmail: false,
  needsAI: false,
  hosting: 'any',
  budget: 'low',
  scale: 'prototype',
};

export const EMPTY_PROFILE: UserProfile = { skills: {}, alreadyPaying: [] };

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Modo privado o cuota llena: se ignora.
  }
}

const isOneOf = <T extends string>(value: unknown, options: readonly T[]): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value);

function isAnswers(value: unknown): value is ProjectAnswers {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isOneOf(v.type, PROJECT_TYPES.map((p) => p.id)) &&
    isOneOf(v.seo, ['none', 'useful', 'critical'] as const) &&
    isOneOf(v.hosting, ['serverless', 'own-server', 'any'] as const) &&
    isOneOf(v.budget, ['free', 'low', 'flexible'] as const) &&
    isOneOf(v.scale, ['prototype', 'product'] as const) &&
    ['realtime', 'needsUsers', 'needsPayments', 'needsFiles', 'needsEmail', 'needsAI'].every(
      (k) => typeof v[k] === 'boolean',
    )
  );
}

function isProfile(value: unknown): value is UserProfile {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const skills = v.skills;
  if (typeof skills !== 'object' || skills === null) return false;
  const levels: readonly SkillLevel[] = ['master', 'know', 'never'];
  return (
    Object.values(skills).every((level) => isOneOf(level, levels)) &&
    Array.isArray(v.alreadyPaying) &&
    v.alreadyPaying.every((id) => typeof id === 'string')
  );
}

export function loadAnswers(): ProjectAnswers {
  const stored = read(ANSWERS_KEY);
  return isAnswers(stored) ? stored : DEFAULT_ANSWERS;
}

export function saveAnswers(answers: ProjectAnswers): void {
  write(ANSWERS_KEY, answers);
}

export function loadProfile(): UserProfile {
  const stored = read(PROFILE_KEY);
  return isProfile(stored) ? stored : EMPTY_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  write(PROFILE_KEY, profile);
}

// ---------------------------------------------------------------------------
// Stack armado a mano
// ---------------------------------------------------------------------------

const BUILD_KEY = 'stack-chooser:build:v1';

/** Quién decidió la tecnología de una capa. */
export type Origin = 'user' | 'suggested';

export interface BuildState {
  selection: ManualSelection;
  origins: Partial<Record<LayerId, Origin>>;
  /** Si es true, las respuestas del proyecto se usan para los avisos (presupuesto, SEO…). */
  useContext: boolean;
}

export const EMPTY_BUILD: BuildState = { selection: {}, origins: {}, useContext: false };

const LAYER_IDS = new Set<string>(LAYERS.map((l) => l.id));

function isBuild(value: unknown): value is BuildState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const { selection, origins } = v;
  if (typeof v.useContext !== 'boolean') return false;
  if (typeof selection !== 'object' || selection === null) return false;
  if (typeof origins !== 'object' || origins === null) return false;
  return (
    Object.entries(selection).every(([k, id]) => LAYER_IDS.has(k) && (id === null || typeof id === 'string')) &&
    Object.entries(origins).every(([k, o]) => LAYER_IDS.has(k) && (o === 'user' || o === 'suggested'))
  );
}

export function loadBuild(): BuildState {
  const stored = read(BUILD_KEY);
  return isBuild(stored) ? stored : EMPTY_BUILD;
}

export function saveBuild(build: BuildState): void {
  write(BUILD_KEY, build);
}
