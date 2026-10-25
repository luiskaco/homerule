import { redirect } from "@/i18n/navigation";

/**
 * La vista por tipo de proyecto se fusionó con el catálogo: hoy es una pestaña
 * de `/mejores-skill`. La ruta vieja se mantiene redirigiendo porque estaba
 * linkeada desde el nav y desde el propio catálogo.
 */
export default async function SkillsPorProyectoPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  redirect({ href: "/mejores-skill", locale: params.locale });
}
