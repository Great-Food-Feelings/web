// Código propio de la web estática. Sustituye a los plugins de WordPress:
// 1. Formulario de contacto: envía el mensaje al Google Apps Script de formulario/Code.gs.
// 2. Año actual en el pie de página.
(() => {
  const FORM_ENDPOINT = ''; // URL de la aplicación web de Apps Script (ver formulario/Code.gs).
  const en = document.documentElement.lang.startsWith('en');

  // 1. Formulario de contacto
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

  // 2. Año del pie de página
  for (const year of document.querySelectorAll('.gff-year')) year.textContent = new Date().getFullYear();
})();
