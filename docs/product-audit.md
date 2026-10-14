# Plan de producto y auditoría · Forma (E/R y E/R extendido)

## Objetivo y usuario
Herramienta de dibujo **conceptual**, sin cuentas, para ~30 alumnos de Bases de Datos. No es un editor de tablas SQL, un ORM ni un sustituto de Moodle. La interacción dominante será lienzo → seleccionar → editar, con pocos controles visibles y más herramientas bajo «Más elementos».

## Hallazgos en el prototipo (antes de este cambio)
- Interfaz inicial de tres columnas siempre visibles, saturada de controles y no orientada al lienzo.
- La escala estaba fijada a **65–140 %**, sin zoom de rueda anclado al cursor.
- Unidades de datos mezcladas con tipos SQL (`VARCHAR`, `INT`) pese a tratarse de un esquema conceptual.
- Los iconos eran parcialmente caracteres decorativos, no una biblioteca uniforme.
- Había soporte para ISA, entidades débiles y agregaciones, pero faltaban tipos de atributos de los apuntes.
- El editor guardaba estado en `localStorage`; no es colaboración en tiempo real ni almacenamiento permanente garantizado.

## Cambios en esta rama
- Nuevos archivos `workspace.css` / `workspace.js` para el rediseño gradual, manteniendo el núcleo original sin un rewrite riesgoso.
- Panel de propiedades cerrado hasta seleccionar un elemento, botones de herramientas esenciales, avanzadas plegables, iconos Lucide, estado más claro y responsive.
- Zoom con rueda anclado al cursor; 20–300 %, botón de encuadrar, Ctrl/Cmd+Z y panorámica con arrastre existentes.
- Enunciado en Markdown en un panel propio con vista de lectura y edición, guardado local y embebido en el JSON del proyecto. **Siempre se sanitiza HTML** con DOMPurify; si no cargan las librerías, se muestra texto sin interpretar.
- Tipos de atributo seleccionables: simple, compuesto, multivaluado, derivado, opcional y clave parcial. **Advertencia académica**: la representación «compuesto» es por ahora una etiqueta visual, no un árbol de subatributos; no cumple por sí sola toda la notación Chen. El documento lo declara para evitar confusión.
- Moodle: modal claro con acceso a curso y exportación para entrega manual. **No consulta ni envía entregas** ni gestiona sesiones del alumno.

## Qué faltaría para soporte Chen/EER completo
Prioridad alta: relación ternaria con cardinalidades por rol, relaciones recursivas con nombres de rol, atributos compuestos con subatributos enlazados por óvalos, multivaluados con doble elipse real en HTML y exportación, atributos derivados con línea discontinua en ambos renderizadores, clave parcial según tipo de entidad débil y su relación identificadora. Cardinalidades y participación mínima y máxima deben probarse contra los ejemplos exactos del profesor, no asumir que las variantes de notación son equivalentes.

Prioridad media: búsqueda, alinear, duplicar, Ctrl+S como proyecto, exportación SVG vectorial, encuadre inteligente de elementos y tests de navegador con Playwright. Sincronización/colaboración: fuera del MVP para una clase trabajando individualmente.

## Moodle de la Junta: integración viable solo condicionalmente
Curso aportado: `https://educacionadistancia.juntadeandalucia.es/centros/malaga/course/view.php?id=2535&section=2#tabs-tree-start`.

Moodle dispone de servicios de tareas de `mod_assign` que, cuando están disponibles para un usuario autorizado, pueden obtener listado/estado de actividades, guardar borradores y, en determinadas configuraciones, enviar definitivamente. *La mera URL del curso no confirma* que la Junta permita esas funciones en el portal ni que el administrador habilite un servicio web para alumnado.

Arquitectura segura futura (si autoriza la administración):
1. Cada alumno inicia sesión individualmente mediante un flujo que no entregue la contraseña a Forma; requeriría cooperación del proveedor de Moodle o servicio de integración autorizado.
2. Un backend de mediación de confianza (no GitHub Pages ni JavaScript público) controla tokens y restringe endpoints/actividades según permisos reales. No registrar ni exponer tokens.
3. Consultar actividades visibles para el usuario, filtrar tareas enviables y mostrar título, fecha y restricciones de formato; no inventar disponibilidad.
4. Generar un PDF o archivo aceptado; subir a borrador si el plugin de entrega admite archivos. Obtener confirmación explícita antes de pulsar «Enviar definitivamente».
5. Verificar respuesta oficial de la tarea y presentar comprobante, o un error seguro. Nunca asumir envío por haber subido a borradores.
6. Si no hay API autorizada, exportar archivo y abrir el enlace del curso para entrega manual.

**Prohibido** pedir al alumnado que pegue su token o contraseña en el HTML y almacenarlo en `localStorage`, llevar credenciales a GitHub, usar CORS proxy de terceros o automatizar solicitudes de Moodle sin autorización.

## Fuentes docentes (proporcionadas por el alumnado)
- Pedro Torres y Cristina Sánchez, *Bases de Datos · Programación del módulo*: 1.ª evaluación, E/R, E/R extendido, transformación a relacional y normalización, pp. 3–5.
- Jorge Sánchez, *Gestión de Bases de Datos*, 2013: sección 1.5.4 de atributos y 1.5.5 de E/R extendido (pp. impresas 40–47): compuestos, múltiples, opcionales, identificadores, ISA y entidades débiles.
- Ramos, Ramos y Montero, *Sistemas gestores de bases de datos*, McGraw-Hill, 2006: sección 1.5, E/R, grado de relaciones y jerarquías.

## Documentación externa oficial
- [Moodle web services](https://moodledev.io/docs/4.5/apis/subsystems/external)
- [API de tareas (funciones mod_assign)](https://moodledev.io/docs/4.5/apis/plugintypes/mod)
- [MDN: wheel events](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)
- [MDN: Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Marked: advertencia de sanitización](https://marked.js.org/#usage)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [Lucide](https://lucide.dev/)
- [WAI WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Validación esperada
- `node --check assets/js/app.js`
- `node --check assets/js/workspace.js`
- `node --test tests/*.test.mjs`
- Pruebas manuales o E2E reales de zoom sobre cursor, traslado de nodos, apertura y cierre de inspector, creación de relaciones ISA, importación/exportación JSON sin pérdida del enunciado, lectura segura del Markdown y exportación PDF.
