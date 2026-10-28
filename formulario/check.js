// Comprueba formulario/Code.gs con los servicios de Google simulados. Uso: node formulario/check.js
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const sent = [];
const google = {
  GmailApp: {
    createDraft: (to, subject, body, options) => ({
      send: () => {
        const mail = { to, subject, body, ...options, inbox: false, unread: false };
        sent.push(mail);
        const thread = {
          moveToInbox: () => { mail.inbox = true; return thread; },
          markUnread: () => { mail.unread = true; return thread; },
        };
        return { getThread: () => thread };
      },
    }),
  },
  Session: { getEffectiveUser: () => ({ getEmail: () => 'buzon@example.com' }) },
  ContentService: {
    MimeType: { JSON: 'json' },
    createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
  },
};
vm.createContext(google);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8'), google);
const post = (parameter) => google.doPost({ parameter });
const valid = { nombre: 'Ana', email: 'ana@example.com', asunto: 'Pollo\r\nBcc: x@example.com', mensaje: 'Hola', idioma: 'es' };

assert.deepStrictEqual(post({ ...valid, web: 'https://spam.example' }), { ok: true });
assert.strictEqual(sent.length, 0, 'el campo trampa no debe enviar correo');
assert.deepStrictEqual(post({ ...valid, email: 'no-es-un-email' }), { ok: false });
assert.deepStrictEqual(post({ ...valid, mensaje: '   ' }), { ok: false });
assert.deepStrictEqual(google.doPost({}), { ok: false });
assert.deepStrictEqual(post(valid), { ok: true });
assert.strictEqual(sent.length, 1);
assert.strictEqual(sent[0].to, 'gff@greatfoodfeelings.com');
assert.strictEqual(sent[0].replyTo, 'ana@example.com');
assert.ok(!/[\r\n]/.test(sent[0].subject), 'el asunto no debe llevar saltos de línea');
assert.ok(sent[0].inbox && sent[0].unread, 'el aviso debe quedar sin leer en la bandeja de entrada');
console.log('formulario/Code.gs: todo correcto');
