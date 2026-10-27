/**
 * Formulario de contacto de www.greatfoodfeelings.com.
 * Recibe los mensajes de la web y los reenvía por correo desde la cuenta de Google que despliega este script.
 *
 * Despliegue (una sola vez):
 * 1. En https://script.google.com, crea un proyecto nuevo y pega este archivo.
 * 2. Implementar > Nueva implementación > Tipo: Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 3. Autoriza el envío de correo y copia la URL de la aplicación web.
 * 4. Pon esa URL en FORM_ENDPOINT, dentro de docs/site.js.
 */
const DESTINO = 'gff@greatfoodfeelings.com'; // Si se deja vacío, el correo llega a la cuenta que despliega el script.

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.web) return respuesta(true); // Campo trampa: solo lo rellenan los robots.
  const linea = (valor, max) => String(valor || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
  const nombre = linea(p.nombre, 400);
  const email = linea(p.email, 400);
  const asunto = linea(p.asunto, 400);
  const mensaje = String(p.mensaje || '').trim().slice(0, 5000);
  if (!nombre || !mensaje || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return respuesta(false);
  MailApp.sendEmail({
    to: DESTINO || Session.getEffectiveUser().getEmail(),
    replyTo: email,
    name: 'Web Great Food Feelings',
    subject: 'Web: ' + (asunto || 'mensaje de ' + nombre),
    body: `Nombre: ${nombre}\nEmail: ${email}\nAsunto: ${asunto}\nIdioma: ${linea(p.idioma, 5)}\n\n${mensaje}`,
  });
  return respuesta(true);
}

function respuesta(ok) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON);
}
