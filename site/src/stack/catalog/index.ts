import type { Technology } from '../domain/types';
import { BACKEND, DATABASE, ORM } from './data';
import { FRONTEND, UI, CMS } from './frontend';
import { AI, AUTH, EMAIL, FILES, PAYMENTS } from './services';
import { CICD, DEPLOY, E2E, MONITORING, TESTING } from './ops';

export const CATALOG: Technology[] = [
  ...FRONTEND,
  ...UI,
  ...CMS,
  ...DATABASE,
  ...BACKEND,
  ...ORM,
  ...AUTH,
  ...PAYMENTS,
  ...FILES,
  ...EMAIL,
  ...AI,
  ...DEPLOY,
  ...TESTING,
  ...E2E,
  ...CICD,
  ...MONITORING,
];

export const CATALOG_BY_ID: ReadonlyMap<string, Technology> = new Map(CATALOG.map((t) => [t.id, t]));
