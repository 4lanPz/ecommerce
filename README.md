# Ecommerce

Tienda en línea (Node.js + Express + Handlebars) para catálogo de productos de
belleza y salud, con carrito de compras y registro de pedidos.

## Modo demo

El proyecto arranca en **modo demo** automáticamente cuando no existe un archivo
`.env` con `MONGODB_URI`. En este modo:

- Usa 10 productos de ejemplo repartidos en 4 categorías (`src/demo/data.js`).
- Genera las imágenes como SVG (`/demo/img/:slug.svg`), sin depender de Cloudinary
  ni de conexión a internet.
- Los pedidos no se guardan ni se envía correo: se imprimen en la consola.
- El administrador entra con un usuario de prueba, sin base de datos.

### Credenciales de prueba

| Campo | Valor |
| --- | --- |
| Correo | `admin@demo.com` |
| Contraseña | `demo1234` |

Vienen precargadas en el formulario de login, así que basta con pulsar *Entrar*.
Los productos y categorías que crees se guardan **en memoria**: se pierden al
reiniciar el servidor, lo cual es útil para dejar la demo siempre igual.

Para levantarla:

```bash
npm install
npm start
```

Luego abrir <http://localhost:5000>.

Con `npm run dev` se levanta con nodemon (recarga automática).

### Qué se puede mostrar en la demo

| Funcionalidad | Estado |
| --- | --- |
| Catálogo por categorías con precios | Funciona |
| Agregar al carrito, cambiar cantidad, eliminar | Funciona |
| Total del carrito y contador de artículos | Funciona |
| Formulario de datos y confirmación del pedido | Funciona |
| Login de administrador | Funciona (usuario de prueba) |
| Crear, editar y eliminar productos | Funciona (en memoria) |
| Crear, editar y eliminar categorías | Funciona (en memoria) |
| Subir imágenes propias | Requiere Cloudinary |
| Envío de correos y recuperar contraseña | Requiere Mailtrap y base de datos |

En modo demo la imagen de cada producto se genera automáticamente a partir de su
nombre, por lo que el campo de subir archivo no aparece en el formulario.

### Recorrido sugerido para la presentación

1. Abrir la tienda y recorrer las categorías con sus precios.
2. Agregar dos o tres productos al carrito, cambiar cantidades y ver el total.
3. Finalizar la compra: llenar los datos de contacto y confirmar el pedido.
4. Entrar como administrador (*Administrador* en el menú) y crear un producto.
5. Volver al inicio y mostrar el producto nuevo ya publicado en la tienda.

## Modo con base de datos (persistente)

Cada servicio se detecta por separado, así que **solo MongoDB ya alcanza** para
tener una tienda que guarda todo. Cloudinary y Mailtrap son opcionales.

| Variable | Qué activa | ¿Obligatoria? |
| --- | --- | --- |
| `MONGODB_URI` | Guarda productos, categorías, pedidos y sesiones | Sí |
| `SESSION_SECRET` | Firma las cookies de sesión | Sí (en producción) |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | Subir imágenes propias; sin ellas se generan SVG | No |
| `HOST_MAILTRAP`, `PORT_MAILTRAP`, `USER_MAILTRAP`, `PASS_MAILTRAP` | Correos de pedido y recuperar contraseña | No |

### Puesta en marcha

1. Copiar `.env.example` a `.env` y poner al menos `MONGODB_URI` y `SESSION_SECRET`.
2. Crear el administrador y el catálogo de ejemplo:

   ```bash
   npm run seed
   ```

   Esto crea el usuario `admin@demo.com` / `demo1234` ya confirmado (se puede
   cambiar con `ADMIN_EMAIL` y `ADMIN_PASSWORD`). Es repetible: si te quedas
   fuera, vuelve a correrlo y se restaura el acceso. El catálogo solo se carga
   si la tienda está vacía, así que no pisa tus datos.
3. `npm start`.

### Sin Cloudinary y sin Mailtrap

- Las imágenes se generan como SVG desde el nombre del producto, igual que en la
  demo, y el formulario no pide subir archivo.
- Los pedidos **se guardan en la base de datos** y además se imprimen en consola,
  en lugar de enviarse por correo.
- Las cuentas nuevas quedan confirmadas automáticamente (sin correo no hay forma
  de confirmarlas); la recuperación de contraseña queda desactivada con un aviso.

## Despliegue en Vercel

Las sesiones se guardan en MongoDB, no en la memoria del proceso, que es lo que
hace falta para que funcione en serverless: sin eso el login se pierde entre
requests y la aplicación devuelve al formulario de login a media navegación.

En *Settings → Environment Variables* hay que cargar `MONGODB_URI` y
`SESSION_SECRET`. En MongoDB Atlas, *Network Access* debe permitir `0.0.0.0/0`,
porque las funciones de Vercel no tienen IP fija.
