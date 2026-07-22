// Datos de prueba genéricos (no tocan la base de datos).
// Misma estructura que los datos de demo originales: las imágenes se generan
// como SVG desde /demo/img/:slug.svg, así que funciona sin internet ni Cloudinary.

const categories = [
    { _id: 'cat-a', name: 'Categoría A', imageUrl: '/demo/img/cat-a.svg' },
    { _id: 'cat-b', name: 'Categoría B', imageUrl: '/demo/img/cat-b.svg' },
    { _id: 'cat-c', name: 'Categoría C', imageUrl: '/demo/img/cat-c.svg' },
    { _id: 'cat-d', name: 'Categoría D', imageUrl: '/demo/img/cat-d.svg' }
]

const products = [
    {
        _id: 'prod-001',
        title: 'Producto de prueba 01',
        description: 'Descripción corta de ejemplo.',
        category: 'Categoría A',
        price: 9.99,
        user: 'demo',
        image: { public_id: 'demo-001', secure_url: '/demo/img/prod-001.svg' }
    },
    {
        _id: 'prod-002',
        title: 'Producto de prueba 02',
        description: 'Descripción de ejemplo de longitud media, útil para verificar cómo se comporta la tarjeta cuando el texto ocupa dos o tres líneas.',
        category: 'Categoría A',
        price: 15.00,
        user: 'demo',
        image: { public_id: 'demo-002', secure_url: '/demo/img/prod-002.svg' }
    },
    {
        _id: 'prod-003',
        title: 'Producto de prueba 03 con un título deliberadamente largo para probar el recorte',
        description: 'Caso borde: título largo. Sirve para comprobar truncado, saltos de línea y alineación en la grilla.',
        category: 'Categoría A',
        price: 129.95,
        user: 'demo',
        image: { public_id: 'demo-003', secure_url: '/demo/img/prod-003.svg' }
    },
    {
        _id: 'prod-004',
        title: 'Producto de prueba 04',
        description: 'Descripción de ejemplo con acentos, eñes y símbolos: á é í ó ú ñ ü — «comillas» & 100% ✓.',
        category: 'Categoría B',
        price: 4.50,
        user: 'demo',
        image: { public_id: 'demo-004', secure_url: '/demo/img/prod-004.svg' }
    },
    {
        _id: 'prod-005',
        title: 'Producto de prueba 05',
        description: 'Descripción de ejemplo para validar el diseño del listado y del detalle.',
        category: 'Categoría B',
        price: 0.99,
        user: 'demo',
        image: { public_id: 'demo-005', secure_url: '/demo/img/prod-005.svg' }
    },
    {
        _id: 'prod-006',
        title: 'Producto de prueba 06',
        description: 'Descripción de ejemplo para validar el diseño del listado y del detalle.',
        category: 'Categoría B',
        price: 49.00,
        user: 'demo',
        image: { public_id: 'demo-006', secure_url: '/demo/img/prod-006.svg' }
    },
    {
        _id: 'prod-007',
        title: 'Producto de prueba 07',
        description: 'Descripción larga de ejemplo. Repite contenido de relleno para llenar el espacio disponible y comprobar el scroll, el interlineado y el corte del texto en pantallas pequeñas. Repite contenido de relleno para llenar el espacio disponible.',
        category: 'Categoría C',
        price: 250.00,
        user: 'demo',
        image: { public_id: 'demo-007', secure_url: '/demo/img/prod-007.svg' }
    },
    {
        _id: 'prod-008',
        title: 'Producto de prueba 08',
        description: 'Descripción de ejemplo para validar el diseño del listado y del detalle.',
        category: 'Categoría C',
        price: 1299.99,
        user: 'demo',
        image: { public_id: 'demo-008', secure_url: '/demo/img/prod-008.svg' }
    },
    {
        _id: 'prod-009',
        title: 'Producto de prueba 09',
        description: 'Descripción de ejemplo para validar el diseño del listado y del detalle.',
        category: 'Categoría D',
        price: 7.25,
        user: 'demo',
        image: { public_id: 'demo-009', secure_url: '/demo/img/prod-009.svg' }
    },
    {
        _id: 'prod-010',
        title: 'Producto de prueba 10',
        description: 'Descripción de ejemplo para validar el diseño del listado y del detalle.',
        category: 'Categoría D',
        price: 33.33,
        user: 'demo',
        image: { public_id: 'demo-010', secure_url: '/demo/img/prod-010.svg' }
    }
]

module.exports = { categories, products }
