import type { LayerDef } from './types';

/**
 * El orden importa: una capa solo puede apoyarse en capacidades que aportaron
 * las anteriores (la base de datos antes que el ORM, el deploy antes del CI).
 */
export const LAYERS: LayerDef[] = [
  { id: 'frontend', label: 'Frontend', appliesTo: ['landing', 'ecommerce', 'saas', 'mobile', 'desktop', 'ai-app'] },
  { id: 'ui', label: 'UI y estilos', appliesTo: ['landing', 'ecommerce', 'saas', 'desktop', 'ai-app'] },
  { id: 'cms', label: 'CMS', appliesTo: ['wordpress'] },
  {
    id: 'database',
    label: 'Base de datos',
    appliesTo: ['ecommerce', 'saas', 'api', 'mobile', 'desktop', 'ai-app', 'wordpress', 'automation', 'data-scripts'],
  },
  {
    id: 'backend',
    label: 'Backend',
    appliesTo: ['landing', 'ecommerce', 'saas', 'api', 'mobile', 'desktop', 'ai-app', 'automation', 'data-scripts'],
    // Una landing o una app de escritorio solo necesitan servidor si piden algo que no se puede hacer en el cliente.
    active: (a) =>
      a.type === 'landing'
        ? a.needsFiles || a.needsAI
        : a.type === 'desktop'
          ? a.needsFiles || a.needsAI || a.needsEmail
          : true,
  },
  { id: 'orm', label: 'ORM / acceso a datos', appliesTo: ['ecommerce', 'saas', 'api', 'mobile', 'ai-app'] },
  { id: 'auth', label: 'Autenticación', appliesTo: 'all', active: (a) => a.needsUsers },
  { id: 'payments', label: 'Pagos', appliesTo: 'all', active: (a) => a.needsPayments },
  { id: 'files', label: 'Archivos', appliesTo: 'all', active: (a) => a.needsFiles },
  { id: 'email', label: 'Email', appliesTo: 'all', active: (a) => a.needsEmail },
  { id: 'ai', label: 'IA / LLM', appliesTo: 'all', active: (a) => a.needsAI },
  { id: 'deploy', label: 'Deploy y hosting', appliesTo: 'all' },
  { id: 'testing', label: 'Testing', appliesTo: 'all' },
  {
    id: 'e2e',
    label: 'Tests de punta a punta',
    appliesTo: ['landing', 'ecommerce', 'saas', 'ai-app'],
    active: (a) => a.scale === 'product',
  },
  { id: 'cicd', label: 'CI/CD', appliesTo: 'all' },
  { id: 'monitoring', label: 'Monitoreo', appliesTo: 'all', active: (a) => a.scale === 'product' },
];
