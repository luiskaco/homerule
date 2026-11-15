import type { ProjectTypeDef } from './types';

export const PROJECT_TYPES: ProjectTypeDef[] = [
  { id: 'landing', label: 'Landing o sitio de contenido', description: 'Páginas públicas, blog, portafolio, sitio corporativo.' },
  { id: 'ecommerce', label: 'E-commerce', description: 'Tienda con catálogo, carrito y pagos.' },
  { id: 'saas', label: 'SaaS / aplicación web', description: 'Producto con cuentas de usuario y lógica propia.' },
  { id: 'api', label: 'API / servicio backend', description: 'Un servicio que otros sistemas consumen.' },
  { id: 'mobile', label: 'App móvil', description: 'Aplicación para iOS y Android.' },
  { id: 'desktop', label: 'App de escritorio', description: 'Programa para Windows, macOS o Linux.' },
  { id: 'wordpress', label: 'Sitio WordPress', description: 'Sitio o tienda sobre WordPress.' },
  { id: 'automation', label: 'Automatización', description: 'Flujos que conectan servicios y tareas programadas.' },
  { id: 'ai-app', label: 'App con IA', description: 'Producto cuyo núcleo usa un modelo de lenguaje.' },
  { id: 'data-scripts', label: 'Scripts de datos', description: 'Procesos de extracción, limpieza y análisis.' },
];
