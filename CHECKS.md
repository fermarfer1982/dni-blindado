# Comprobación de funcionamiento

Fecha: 2026-03-05

Se realizó una comprobación funcional de la versión desplegada en:

- https://fermarfer1982.github.io/dni-blindado/

## Resultado

✅ **Correcto**: la aplicación carga y muestra los controles principales esperados.

Elementos verificados automáticamente en navegador:

1. Cabecera `DNI Blindado`.
2. Botón `Cargar foto`.
3. Sección `Vista previa`.
4. Botón `Descargar imagen`.

## Evidencia

Captura tomada durante la validación automatizada:

- `artifacts/dni-blindado-check.png`

## Nota de entorno (CLI)

Desde `curl` en este entorno concreto se recibe `403` por túnel/proxy de red (`CONNECT tunnel failed`),
pero la validación en navegador automatizado sí pudo completar correctamente la carga y comprobación de la UI.
