# 🛡️ AI Governance & Development Rules (-makeRuleIA)

Este repositorio contiene el conjunto de directrices, estándares de arquitectura, políticas de seguridad y reglas de gobernanza que deben regir todo el proceso de desarrollo de software en nuestro ecosistema, con un enfoque especial en **instrucciones de sistema y contexto para agentes de Inteligencia Artificial (IA)** y desarrolladores.

El objetivo principal es asegurar la creación de sistemas **seguros, escalables, mantenibles, modernos y listos para producción**, previniendo la deuda técnica y los hacks rápidos.

---

## 📌 Estructura del Repositorio

El repositorio se divide en dos conjuntos principales de reglas según su nivel de granularidad y versión:

### 1. `ai_governance_rules_v2/` (Reglas Modulares Detalladas)
Una especificación granular estructurada en 15 secciones para cubrir detalladamente cada aspecto del ciclo de vida del software:
*   [01_core.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/01_core.md): Principios fundamentales y filosofía de desarrollo.
*   [02_documentation.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/02_documentation.md): Estructura base de documentación obligatoria (`PRD`, `SDD`, `SYSTEM_SPEC`, etc.).
*   [03_architecture.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/03_architecture.md): Principios de separación de responsabilidades y desacoplamiento.
*   [04_security_core.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/04_security_core.md): Fundamentos de seguridad y minimización de superficie de ataque.
*   [05_auth_security.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/05_auth_security.md): Políticas de autenticación y autorización segura.
*   [06_frontend_security.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/06_frontend_security.md): Sanitización, protección XSS, CSRF y manejo seguro del estado.
*   [07_backend_security.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/07_backend_security.md): Validación de inputs, ORM, protección de base de datos y control de tasa de peticiones.
*   [08_cloud_cicd_security.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/08_cloud_cicd_security.md): IAM, escaneo de dependencias, protección de secrets e infraestructura.
*   [09_ai_security.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/09_ai_security.md): Gobernanza de IA, mitigación de Prompt Injection y trazabilidad.
*   [10_ui_ux.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/10_ui_ux.md): Estética premium, animaciones, diseño responsive y accesibilidad.
*   [11_performance.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/11_performance.md): Optimización de assets, lazy loading y carga eficiente.
*   [12_testing.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/12_testing.md): Pirámide de pruebas, cobertura y pruebas de flujo completo.
*   [13_observability.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/13_observability.md): Logs estructurados, tracing y alertas operativas.
*   [14_conventions.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/14_conventions.md): Convenciones de nomenclatura y Conventional Commits.
*   [15_resilience.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rules_v2/15_resilience.md): Tolerancia a fallos, degradación controlada y rollbacks.

### 2. `ai_governance_rule_v3_resume/` (Resumen Consolidado v3)
Una versión optimizada y consolidada en 4 grandes pilares, idónea para ser cargada en el contexto de agentes de IA con límites de tokens más estrictos:
*   [01_core_and_process.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rule_v3_resume/01_core_and_process.md): Filosofía general, reglas de planificación obligatoria y estructura de documentación.
*   [02_architecture_and_security.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rule_v3_resume/02_architecture_and_security.md): Estándares de arquitectura limpia y seguridad multinivel (Frontend, Backend, Autenticación).
*   [03_ui_ux_and_performance.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rule_v3_resume/03_ui_ux_and_performance.md): Criterios de diseño visual premium (aesthetically wow), accesibilidad y rendimiento.
*   [04_operations_ai_and_quality.md](file:///c:/Users/PcLocal/Desktop/developOrange/-makeRuleIA/ai_governance_rule_v3_resume/04_operations_ai_and_quality.md): Gobernanza de IA, resiliencia cloud, observabilidad, testing y la regla de validación final de flujos.

---

## 🌟 La Regla de Oro: Planificación Obligatoria

Tanto los desarrolladores humanos como los agentes de IA tienen estrictamente prohibido realizar cambios directos de código o comandos destructivos sin seguir el flujo de tres fases:

1.  **Analizar y Planificar:** Diseñar la estrategia de solución y evaluar impactos en otros componentes.
2.  **Validar y Preguntar:** Alinear decisiones críticas de diseño y arquitectura con los líderes de proyecto o usuarios antes de programar.
3.  **Ejecutar e Integrar:** Escribir código limpio y documentado siguiendo las directrices de este repositorio, asegurando pruebas reales de flujo completo.

---

## 🛠️ Cómo Utilizar este Repositorio

*   **Para Agentes de IA (Copilots, Custom GPTs, etc.):** 
    Se recomienda inyectar el contenido de la carpeta `ai_governance_rule_v3_resume/` en las instrucciones de sistema o "Custom Instructions" del agente para garantizar que actúe de acuerdo con nuestros estándares de ingeniería.
*   **Para Desarrolladores:**
    Utilizar los archivos de `ai_governance_rules_v2/` como manual de referencia rápido durante las fases de diseño técnico (SDD), revisiones de código (PRs) e implementación de pruebas.
