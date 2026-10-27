// Código propio de la web estática. Sustituye a los plugins de WordPress:
// 1. Aviso de cookies: Google Analytics solo se carga si el visitante acepta.
// 2. Formulario de contacto: envía el mensaje al Google Apps Script de formulario/Code.gs.
// 3. Año actual en el pie de página.
(() => {
  const GA_ID = 'GT-5TPCHCXL';
  const FORM_ENDPOINT = ''; // URL de la aplicación web de Apps Script (ver formulario/Code.gs).
  const CONSENT_KEY = 'gff-cookies';
  const CONSENT_DAYS = 365; // La AEPD pide volver a preguntar como máximo a los 24 meses.
  const en = document.documentElement.lang.startsWith('en');

  // 1. Aviso de cookies
  const banner = document.getElementById('cookie-banner');

  const loadAnalytics = () => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.append(script);
  };

  const savedConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return saved && Date.now() - saved.date < CONSENT_DAYS * 864e5 ? saved.value : null;
    } catch {
      return null;
    }
  };

  const removeAnalyticsCookies = () => {
    const domain = location.hostname.replace(/^www\./, '');
    for (const name of document.cookie.split(/;\s*/).map((cookie) => cookie.split('=')[0])) {
      if (!name.startsWith('_ga')) continue;
      document.cookie = `${name}=; Max-Age=0; path=/`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`;
    }
  };

  const consent = savedConsent();
  if (consent === 'yes') loadAnalytics();
  if (banner && !consent) banner.hidden = false;

  banner?.addEventListener('click', (event) => {
    const value = event.target.dataset.consent;
    if (!value) return;
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, date: Date.now() }));
    } catch {
      // Sin almacenamiento local, el aviso vuelve a salir en la próxima visita.
    }
    banner.hidden = true;
    if (value === 'yes' && !window.gtag) loadAnalytics();
    if (value === 'no' && (window.gtag || document.cookie.includes('_ga'))) {
      // Sin esto, Analytics vuelve a escribir sus cookies al recargar la página.
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      removeAnalyticsCookies();
      location.reload(); // Quita Google Analytics de la página ya abierta.
    }
  });

  for (const link of document.querySelectorAll('a[href="#cookies-config"]')) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (banner) banner.hidden = false;
    });
  }

  // 2. Formulario de contacto
  const form = document.querySelector('form.gff-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const output = form.querySelector('.wpcf7-response-output');
    const button = form.querySelector('[type="submit"]');
    const show = (state, text) => {
      form.classList.remove('init', 'submitting', 'sent', 'failed');
      form.classList.add(state);
      output.textContent = text;
    };
    show('submitting', '');
    button.disabled = true;
    const data = new URLSearchParams(new FormData(form));
    data.set('idioma', en ? 'en' : 'es');
    try {
      const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: data });
      if (!(await response.json()).ok) throw new Error('El servidor rechazó el mensaje');
      form.reset();
      show('sent', en ? 'Thank you. We have received your message.' : 'Gracias. Hemos recibido tu mensaje.');
    } catch {
      show('failed', en
        ? 'Your message could not be sent. Please try again later.'
        : 'No se ha podido enviar el mensaje. Inténtalo de nuevo más tarde.');
    } finally {
      button.disabled = false;
    }
  });

  // 3. Año del pie de página
  for (const year of document.querySelectorAll('.gff-year')) year.textContent = new Date().getFullYear();
})();
