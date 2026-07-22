// Capacidades de la aplicación.
//
// Antes existía una sola bandera `isDemo`: con MONGODB_URI se activaba todo
// (base de datos + Cloudinary + correo) y sin ella nada. Eso obligaba a
// configurar los tres servicios para poder usar la base de datos.
//
// Ahora cada servicio se detecta por separado, así que basta con MongoDB para
// tener una tienda persistente: las imágenes se siguen generando como SVG y los
// pedidos se registran en consola hasta que configures Cloudinary y Mailtrap.
const hasDatabase = Boolean(process.env.MONGODB_URI)
const hasCloudinary = Boolean(process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET)
const hasMail = Boolean(process.env.HOST_MAILTRAP && process.env.USER_MAILTRAP && process.env.PASS_MAILTRAP)

// Sin base de datos se usa el almacén en memoria y el usuario de prueba.
const isDemo = !hasDatabase

module.exports = { hasDatabase, hasCloudinary, hasMail, isDemo }
