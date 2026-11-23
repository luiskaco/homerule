// Tipos del dominio. Todo el catálogo y el motor se apoyan en estas formas.

export type ProjectTypeId =
  | 'landing'
  | 'ecommerce'
  | 'saas'
  | 'api'
  | 'mobile'
  | 'desktop'
  | 'wordpress'
  | 'automation'
  | 'ai-app'
  | 'data-scripts';

export type LayerId =
  | 'frontend'
  | 'ui'
  | 'cms'
  | 'database'
  | 'backend'
  | 'orm'
  | 'auth'
  | 'payments'
  | 'files'
  | 'email'
  | 'ai'
  | 'deploy'
  | 'testing'
  | 'e2e'
  | 'cicd'
  | 'monitoring';

/** Cualidades que el motor sabe premiar según lo que pide el proyecto. */
export type Trait =
  | 'seo-friendly'
  | 'realtime'
  | 'serverless-friendly'
  | 'self-hostable'
  | 'quick-start'
  | 'mature'
  | 'type-safe'
  | 'batteries-included'
  | 'lightweight'
  | 'ai-friendly';

/**
 * Capacidad que una tecnología ofrece (`provides`) o necesita (`needs`).
 * Es lo que evita combinaciones rotas: Drizzle necesita `js-runtime` y una
 * base `sql-db`, y solo se ofrece si lo elegido antes las aporta.
 *
 * Capacidades en uso: js-tooling, js-runtime, spa, static, ssr, react, vue,
 * svelte, react-native, dart, desktop-shell, backend, backend-capable, http-api,
 * python, php, go, ruby, wordpress, sql-db, postgres, mysql, sqlite, nosql-db, mongo,
 * supabase, firebase, orm, orm-builtin, auth, payments, files, email, llm,
 * vercel, netlify, cloudflare, paas, vps, github.
 */
export type Capability = string;

/** Un texto es obligatorio; un arreglo significa "alguna de estas". */
export type Need = Capability | Capability[];

export type Cost = 'free' | 'freemium' | 'usage' | 'paid';

export type SeoLevel = 'none' | 'useful' | 'critical';
export type HostingPreference = 'serverless' | 'own-server' | 'any';
export type Budget = 'free' | 'low' | 'flexible';
export type Scale = 'prototype' | 'product';

/** Respuestas del usuario sobre el proyecto. */
export interface ProjectAnswers {
  type: ProjectTypeId;
  seo: SeoLevel;
  realtime: boolean;
  needsUsers: boolean;
  needsPayments: boolean;
  needsFiles: boolean;
  needsEmail: boolean;
  needsAI: boolean;
  hosting: HostingPreference;
  budget: Budget;
  scale: Scale;
}

/** Condición declarativa sobre una respuesta, para descartar una tecnología. */
export type Condition = {
  [K in 'seo' | 'hosting' | 'budget' | 'scale' | 'realtime']: {
    key: K;
    is: ProjectAnswers[K];
  };
}['seo' | 'hosting' | 'budget' | 'scale' | 'realtime'];

export interface Technology {
  id: string;
  name: string;
  layer: LayerId;
  /** Tipos de proyecto donde tiene sentido. */
  types: ProjectTypeId[] | 'all';
  /** Para qué sirve, en una frase. */
  solves: string;
  traits: Trait[];
  /** Tipos de proyecto donde suele ser la primera opción. */
  bestFor: ProjectTypeId[];
  provides: Capability[];
  needs: Need[];
  /** Ids de tecnologías con las que choca. */
  conflicts: string[];
  /** Se descarta si el proyecto cumple alguna de estas condiciones. */
  excludeWhen: Condition[];
  /** Cuándo conviene evitarla (texto para mostrar). */
  avoidWhen: string[];
  cost: Cost;
  /** Una opción "no hace falta": no se lista como tecnología a instalar. */
  isNone: boolean;
  /** Fecha (AAAA-MM-DD) en que se verificó contra documentación vigente; null = sin verificar. */
  verifiedAt: string | null;
  /** Documentación con la que se verificó. */
  source: string;
}

/**
 * Stack armado a mano: capa → id de tecnología.
 * `null` = "no uso nada en esta capa"; capa ausente = todavía sin elegir.
 */
export type ManualSelection = Partial<Record<LayerId, string | null>>;

export type SkillLevel = 'master' | 'know' | 'never';

/** Lo que el usuario ya domina o ya paga. Las claves son ids de tecnología. */
export interface UserProfile {
  skills: Record<string, SkillLevel>;
  alreadyPaying: string[];
}

export interface LayerDef {
  id: LayerId;
  label: string;
  appliesTo: ProjectTypeId[] | 'all';
  /** Si existe, la capa solo se muestra cuando devuelve true. */
  active?: (answers: ProjectAnswers) => boolean;
}

export interface ProjectTypeDef {
  id: ProjectTypeId;
  label: string;
  description: string;
}
