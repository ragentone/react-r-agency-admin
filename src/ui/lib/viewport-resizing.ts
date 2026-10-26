/**
 * Markiert `<html>` mit `data-viewport-resizing`, solange sich der Viewport ändert
 * (Tastatur ein/aus in der App-WebView, Fensterrotation, Desktop-Resize).
 *
 * Grund: Drawer-Höhen hängen an `dvh` und haben eine `height`-Transition. Ohne diese
 * Markierung läuft `bottom: 0` sofort mit, die Höhe aber 450 ms hinterher → der Drawer
 * springt hoch und runter. Während des Resizes wird die Höhen-Transition deshalb
 * abgeschaltet (siehe `drawer.tsx`).
 */
const SETTLE_MS = 180;

let installed = false;

export function installViewportResizingFlag(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const root = document.documentElement;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const onResize = () => {
    if (!root.hasAttribute('data-viewport-resizing')) {
      root.setAttribute('data-viewport-resizing', '');
    }
    clearTimeout(timer);
    timer = setTimeout(() => root.removeAttribute('data-viewport-resizing'), SETTLE_MS);
  };

  window.addEventListener('resize', onResize, { passive: true });
  window.visualViewport?.addEventListener('resize', onResize, { passive: true });
}
