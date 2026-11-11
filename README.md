# Planificador de prácticas FFE

MicroApp estática para calcular la fecha prevista de finalización de la Formación en Empresa (FFE).

## Uso

Abrir `index.html` en un navegador o publicar el repositorio con GitHub Pages.

- Fecha de inicio, horas totales, horas realizadas y horas por jornada.
- Selección de días de asistencia.
- Exclusión manual de festivos, vacaciones y días sin asistencia (`AAAA-MM-DD`, una fecha por línea).
- Tabla de jornadas, impresión y exportación CSV.

**Aviso:** no hay calendario oficial integrado. Es obligatorio comprobar festivos nacionales, autonómicos, locales, periodos no lectivos y el calendario de la empresa. El resultado es orientativo.

## Privacidad y arquitectura

Todo el cálculo se realiza localmente en el navegador, sin enviar datos a servidores ni almacenar información de alumnos. No requiere autenticación, backend, dependencias ni claves API. No introducir datos personales sensibles.

## Publicación

En GitHub: Settings → Pages → Deploy from a branch → `main` / `/(root)` → Save.
