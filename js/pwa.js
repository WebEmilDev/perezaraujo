(function () {
  'use strict';

  var deferredPrompt = null;

  function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function (err) {
          // eslint-disable-next-line no-console
          console.warn('SW registro falló', err);
        });
      });
    }
  }

  function setupBeforeInstallPrompt() {
    var installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredPrompt = event;
    });

    if (installBtn) {
      installBtn.addEventListener('click', function () {
        if (deferredPrompt) {
          installBtn.disabled = true;
          deferredPrompt.prompt();
          deferredPrompt.userChoice.finally(function () {
            deferredPrompt = null;
            installBtn.disabled = false;
          });
        } else {
          // Fallback cuando no hay evento (por ejemplo file://)
          try {
            window.alert('Para instalar esta app abre esta página desde Chrome en Android con conexión segura (http o https).');
          } catch (_) {
            // ignore
          }
        }
      });
    }
  }

  function setupIosBanner() {
    var banner = document.getElementById('ios-install-banner');
    var close = banner ? banner.querySelector('[data-ios-banner-close]') : null;
    if (!banner) return;

    function hide() {
      banner.classList.remove('ios-install-banner--show');
      banner.setAttribute('aria-hidden', 'true');
    }

    if (close) {
      close.addEventListener('click', function () {
        hide();
      });
    }

    if (!isIos() || isStandalone()) {
      hide();
      return;
    }

    banner.classList.add('ios-install-banner--show');
    banner.setAttribute('aria-hidden', 'false');
  }

  function init() {
    registerServiceWorker();
    setupBeforeInstallPrompt();
    setupIosBanner();

    // Ocultar el botón de instalar en iOS (solo mostrar banner)
    var installBtn = document.getElementById('install-btn');
    if (installBtn && isIos()) {
      installBtn.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

