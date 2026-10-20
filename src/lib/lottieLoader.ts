/**
 * Asynchronously loads Lottie player on demand.
 * Prevents loading 168 KiB of animation library on the critical rendering path
 * or on the public landing page where animations are not required.
 */
let lottiePromise: Promise<any> | null = null;

export function loadLottie(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  const win = window as any;
  if (win.lottie && typeof win.lottie.loadAnimation === 'function') {
    return Promise.resolve(win.lottie);
  }
  if (win.bodymovin && typeof win.bodymovin.loadAnimation === 'function') {
    return Promise.resolve(win.bodymovin);
  }

  if (!lottiePromise) {
    lottiePromise = new Promise((resolve) => {
      // Check if script tag already exists in DOM
      const existing = document.querySelector('script[src*="lottie"]');
      if (existing) {
        existing.addEventListener('load', () => {
          resolve(win.lottie || win.bodymovin || null);
        });
        existing.addEventListener('error', () => {
          resolve(null);
        });
        return;
      }

      const script = document.createElement('script');
      script.src = '/vendor/lottie.min.js';
      script.async = true;
      script.onload = () => {
        resolve(win.lottie || win.bodymovin || null);
      };
      script.onerror = (err) => {
        console.warn('Lottie deferred script load warning:', err);
        resolve(null);
      };
      document.body.appendChild(script);
    });
  }

  return lottiePromise;
}
