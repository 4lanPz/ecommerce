// Imágenes generadas: cuando no hay Cloudinary configurado, cada producto y
// categoría apunta a /demo/img/<id>.svg, que se dibuja al vuelo con el nombre
// del elemento (ver routers/demo.routes.js). Así la tienda se ve completa sin
// depender de un servicio externo ni de subir archivos.

// La imagen de un producto tiene la misma forma que la de Cloudinary
// ({ public_id, secure_url }) para que el resto del código no note la diferencia.
const generatedProductImage = (id) => ({
    public_id: String(id),
    secure_url: `/demo/img/${id}.svg`
})

// Las categorías guardan solo la URL
const generatedCategoryImage = (id) => `/demo/img/${id}.svg`

module.exports = { generatedProductImage, generatedCategoryImage }
