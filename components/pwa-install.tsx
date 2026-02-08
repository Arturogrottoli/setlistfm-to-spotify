'use client'

import { useEffect } from 'react'

export default function PWAInstall() {
  useEffect(() => {
    // Registrar el service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error)
      })
    }

    // Escuchar evento de instalación de PWA
    let deferredPrompt: Event | null = null

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      // Aquí podrías mostrar un botón "Instalar app"
    })

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      deferredPrompt = null
    })
  }, [])

  return null
}
