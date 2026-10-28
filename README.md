# Web de Great Food Feelings

Web estática de www.greatfoodfeelings.com. Sustituye a la web hecha con WordPress.

## Qué hay en cada carpeta

- `docs/`: la web publicada. GitHub Pages publica esta carpeta tal cual.
  - `index.html` (español), `en/index.html` (inglés), `legal/` y `en/legal/` (aviso legal y privacidad), `404.html`.
  - `site.js` y `site.css`: el código propio (formulario de contacto y año del pie).
  - `wp-content/`, `wp-includes/` y `fonts/`: estilos, scripts, imágenes y tipografías copiados de la web WordPress, con las mismas rutas.
- `formulario/Code.gs`: el Google Apps Script que recibe el formulario de contacto y lo envía por correo. `node formulario/check.js` lo comprueba.

## Ver la web en local

```bash
python3 -I -m http.server 8080 --directory docs
```

Después, abre http://localhost:8080.

## Cambiar un texto

Los textos están en los archivos HTML de `docs/`. La cabecera y el pie se repiten en cada página, así que un cambio en ellos hay que hacerlo en todas.
