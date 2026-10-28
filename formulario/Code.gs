/**
 * Formulario de contacto de www.greatfoodfeelings.com.
 * Recibe los mensajes de la web y los reenvía por correo desde la cuenta de Google que despliega este script.
 *
 * Despliegue (una sola vez):
 * 1. En https://script.google.com, crea un proyecto nuevo y pega este archivo.
 *    Pon en DESTINO el buzón que recibe los mensajes.
 * 2. Implementar > Nueva implementación > Tipo: Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 3. Autoriza el envío de correo y copia la URL de la aplicación web.
 * 4. Pon esa URL en FORM_ENDPOINT, dentro de docs/site.js.
 *
 * Para cambiar el script sin cambiar la URL: Implementar > Gestionar implementaciones > Editar > Versión: Nueva versión.
 * Una implementación nueva tiene otra URL, y el formulario de la web deja de funcionar hasta cambiar FORM_ENDPOINT.
 */
// Buzón que recibe los mensajes. No puede ser la cuenta que despliega el script, ni un alias o un grupo suyo,
// porque Gmail dejaría el correo solo en Enviados. La copia instalada lleva un buzón interno, que aquí no se publica.
const DESTINO = '(buzón interno)'; // Sin un correo real, el envío falla y la web muestra el error.

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
    to: DESTINO,
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
