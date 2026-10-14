# Forma · Diagramas E/R y E/R extendido

Editor web ligero, sin cuenta ni servidor, para practicar **diseño conceptual** de bases de datos con la notación de Chen en clase. Basado en el prototipo aportado por un compañero, conservando su interfaz y la mayor parte de sus interacciones.

## Usarlo

1. Abre [index.html](./index.html) desde un servidor web estático (por ejemplo `python -m http.server 8000`; visita `http://localhost:8000`). No hace falta instalar dependencias para el editor.
2. Pulsa **Entidad** para crear rectángulos, y añade atributos desde el panel de propiedades.
3. Pulsa **Relación** para unir elementos; configura la cardinalidad en cada extremo, obligatoriedad y atributos propios de la relación.
4. En E/R extendido están disponibles **entidad débil**, **relación identificadora**, **jerarquía ISA** (total/parcial y excluyente/solapada) y **agregación**.
5. **Abrir** recupera un proyecto JSON; **Exportar** permite descargar JSON, PNG, JPG y PDF. **Ejemplo** carga un esquema introductorio sin necesidad de haber estudiado SQL.

**Al guardar:** el navegador conserva el último proyecto en `localStorage` (solo en ese navegador/origen). Exporta un JSON para hacer una copia, entregar el ejercicio o mover el trabajo a otro ordenador. No hay cuentas, trabajo colaborativo en tiempo real ni sincronización entre los 30 alumnos.

## Arquitectura

```text
Diagram/
├── index.html                 # estructura semántica y controles
├── assets/
│   ├── css/styles.css         # diseño, geometrías Chen y responsive
│   └── js/app.js               # estado, herramientas, dibujo, persistencia y exportaciones
├── tests/static.test.mjs      # verificaciones sin dependencias
└── .github/workflows/ci.yml   # tests y sintaxis con Node
```

No hay backend, framework ni proceso de compilación. Los iconos de botones usan **Lucide** mediante un script UMD de versión fijada, con glifos alternativos si el CDN no responde. La fuente web usa una alternativa de sistema si no carga.

## Cómo leer los diagramas

| Notación | Significado |
| --- | --- |
| Rectángulo | Conjunto de entidades; **no** es todavía una tabla SQL. |
| Óvalo | Atributo de entidad o de relación. |
| Texto subrayado en óvalo | Atributo identificador. |
| Rombo | Relación; rombo doble si es identificadora. |
| Rectángulo doble | Entidad débil. |
| `(0,1)`, `(1,1)`, `(0,n)`, `(1,n)` | Mínimo y máximo de participación del extremo. |
| Triángulo ISA | Especialización / generalización; sus subtipos comparten propiedades del supertipo. |
| Arco entre ramas de ISA | Subtipos excluyentes; sin arco, pueden solaparse. |
| Círculo en ISA | Especialización total. |
| Marco de agregación | Trata una relación y sus entidades participantes como unidad. |

**Alcance:** se mantienen relaciones binarias y reflexivas, varias relaciones entre las mismas entidades, atributos de relación, entidades débiles y jerarquías ISA. La herramienta **no representa todavía correctamente todas las variantes académicas**: relaciones ternarias/n-arias, roles explícitos de una relación reflexiva, atributos compuestos con jerarquía de óvalos, multivaluados y derivados, y validación semántica exhaustiva. Tampoco genera automáticamente SQL. Estos límites se documentan para no enseñar que el modelo ya los resuelve. Las variaciones de notación dependen de los apuntes del profesor.

**Precauciones:** no importes archivos que no reconozcas; se valida el JSON antes de cargarlo y se limita a 1,5 MB. Evita compartir PDFs/libros del centro dentro de un repositorio público. Si abres el HTML directamente con `file://`, la persistencia de `localStorage` puede variar según el navegador.

## Material docente consultado

- Presentación *Bases de Datos, Programación del módulo profesional*, Pedro Torres y Cristina Sánchez: 1.ª evaluación, tema 3 **Modelo E/R y E/R extendido**, tema 5 **transformación al relacional**, tema 6 **normalización** (págs. 3–5).
- Jorge Sánchez, *Gestión de Bases de Datos, usando Oracle SQL y PL/SQL*, versión 2.4 (2013), apartados 1.5.2–1.5.5: componentes, cardinalidad, atributos, ISA y entidades débiles (págs. impresas 35–47).
- M. J. Ramos, A. Ramos y F. Montero, *Sistemas gestores de bases de datos*, McGraw-Hill (2006), sección 1.5, modelo entidad-interrelación.

## Documentación técnica de contraste

- Peter P.-S. Chen, [*The Entity-Relationship Model — Toward a Unified View of Data*](https://doi.org/10.1145/320434.320440), ACM TODS, 1976.
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API): diferencias entre almacenamiento local y sincronización.
- [OWASP DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html): entradas no fiables.
- [W3C WCAG 2.2, Focus visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html).
- [Lucide Static](https://lucide.dev/guide/packages/lucide-static): iconos de código abierto.

### Desarrollo

`node --test tests/*.test.mjs` ejecuta verificaciones estáticas; `node --check assets/js/app.js` verifica la sintaxis del JS. Las pruebas estáticas **no sustituyen pruebas reales de navegador** sobre creación de relaciones, mover nodos, edición táctil y exportaciones. Antes de usarlo en evaluación, comprueba un diagrama E/R sencillo y otro E/R extendido según los ejemplos del profesor.

