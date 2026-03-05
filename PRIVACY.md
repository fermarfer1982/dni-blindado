# Política de privacidad de DNI Blindado

`dni-blindado` está diseñado para funcionar **100% en local** dentro de tu navegador.

## Resumen

- No sube imágenes ni datos personales a servidores externos.
- No requiere backend ni base de datos remota.
- No incluye analytics por defecto.
- El procesamiento (marca de agua, blur y redacciones) ocurre en el dispositivo del usuario mediante Canvas.

## Qué datos procesa

- La imagen que tú seleccionas (DNI/NIE/Pasaporte u otro documento).
- Texto local que introduces (motivo, fecha y opciones visuales).

Estos datos solo se usan temporalmente durante la sesión en el navegador para generar el imagen final.

## Compartir y descarga

- **Descargar imagen** guarda el archivo generado en tu dispositivo.
- **Compartir** usa Web Share API del navegador; la app no intermedia ni reenvía archivos a ningún servidor propio.

## Limitaciones

Esta herramienta ayuda a reducir el riesgo de uso indebido, pero no garantiza prevención total de fraude documental.
