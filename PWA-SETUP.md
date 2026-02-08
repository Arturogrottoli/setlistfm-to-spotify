# PWA - Progressive Web App Setup

Tu aplicación ahora es una Progressive Web App (PWA), lo que significa que puede instalarse como una app nativa en celulares y computadoras.

## ¿Qué cambios se hicieron?

✅ **next-pwa instalado**: Librería para facilitar la conversión a PWA  
✅ **manifest.json creado**: Archivo que describe la app (nombre, iconos, etc.)  
✅ **next.config.mjs actualizado**: Configuración de PWA en Next.js  
✅ **layout.tsx actualizado**: Meta tags PWA y registro de service worker  
✅ **Service Worker automático**: next-pwa lo genera automáticamente en build  

## Cómo probar la PWA

### 1. **Construir la app para producción**
```bash
npm run build
npm run start
```

Luego abre `http://localhost:3000` en tu navegador.

### 2. **Instalar en diferentes dispositivos**

#### 📱 **Android**
1. Abre el navegador Chrome en tu Android
2. Ve a `http://localhost:3000` (o tu dominio)
3. Verás un ícono de instalación en la barra de direcciones o en el menú (⋮)
4. Presiona "Instalar app"
5. ¡Listo! La app aparecerá en tu pantalla de inicio

#### 🍎 **iPhone/iPad (iOS)**
1. Abre Safari
2. Ve a `http://localhost:3000`
3. Presiona el botón Compartir (↗️)
4. Selecciona "Añadir a la pantalla principal"
5. Elige un nombre y presiona "Añadir"
6. ¡Listo! La app aparecerá en tu pantalla de inicio

#### 💻 **Windows/Mac (en navegador)**
1. Abre Chrome o Edge
2. Ve a `http://localhost:3000`
3. Presiona el ícono de instalación en la barra de direcciones (⬇️)
4. O usa el menú (⋮) → "Instalar Setlist to Spotify"
5. ¡Listo! Aparecerá un acceso directo en tu escritorio

## Características PWA activadas

- 🔌 **Funciona offline**: Los usuarios pueden ver la app aunque sin internet (después de la primera carga)
- 📦 **Se instala como app**: No necesita App Store o Google Play
- 💾 **Caché inteligente**: Descarga archivos en caché para cargas más rápidas
- 📱 **Responsive**: Se adapta a cualquier tamaño de pantalla
- ⚡ **Rápida**: Carga casi instantáneamente después de instalar

## Notas importantes

1. **Desarrollo vs Producción**: El service worker está **deshabilitado en desarrollo** para que puedas ver cambios en vivo. Se activa en `npm run build` y `npm run start`.

2. **URLs locales**: Si trabajas en `localhost`, los navegadores móviles no pueden acceder directamente. Opciones:
   - Usa un tunnel como **ngrok** o **expose**
   - Despliega a Vercel o cualquier servidor
   - Usa la red local con `npm run build && npm run start` desde tu IP local

3. **Iconos**: Si tienes iconos personalizados en `public/`, actualiza `public/manifest.json` con las rutas correctas.

## Próximos pasos opcionales

Si en el futuro quieres:
- **Notificaciones push**: Agrega `@react-pwa/notification`
- **Acceso a cámara/localización**: Usa las APIs de navegador
- **Sincronización en background**: Configura background sync en el service worker
- **Publicar en App Store**: Usa Capacitor o React Native

¡Tu PWA ya está lista! 🚀
