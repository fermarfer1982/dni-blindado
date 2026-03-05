# dni-blindado

PWA móvil (React + TypeScript) para blindar fotos de DNI/NIE/Pasaporte con:

- Marca de agua con motivo + fecha.
- Redacciones por rectángulos (`Negro` o `Blur`).
- Exportación imagen y compartir con Web Share API.

> Privacidad: todo el procesamiento se realiza localmente en el navegador. Sin backend.

## Requisitos

- Node.js 20+
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL de Vite que aparece en consola (normalmente `http://localhost:5173`).

## Build producción

```bash
npm run build
npm run preview
```

## Deploy gratis en GitHub Pages

Este repositorio ya incluye workflow en `.github/workflows/deploy.yml`.

### 1) Subir repo a GitHub

Crea el repositorio llamado `dni-blindado` y sube la rama `main`.

### 2) Activar Pages con GitHub Actions

1. Ve a **Settings → Pages**.
2. En **Build and deployment**, selecciona **Source: GitHub Actions**.
3. Haz push a `main` y espera el workflow `Deploy to GitHub Pages`.

### 3) Base path para Pages

`vite.config.ts` usa:

```ts
base: process.env.BASE_PATH ?? '/'
```

En el workflow se establece:

```yml
BASE_PATH: /dni-blindado/
```

Si renombrases el repositorio, cambia `BASE_PATH` en el workflow al nuevo nombre, por ejemplo `/mi-nuevo-repo/`.

## PWA / Offline

- `vite-plugin-pwa` genera manifest y service worker.
- Los assets se cachean para uso offline.
- Usa un icono SVG único compatible con instalación PWA.

## Aviso legal

Esta herramienta no garantiza prevención total de fraude. Úsala bajo tu responsabilidad.

## Licencia

MIT. Ver [LICENSE](./LICENSE).
