// Almacén en memoria para el modo demo.
// Reemplaza a MongoDB: permite listar, crear, editar y eliminar productos y
// categorías durante la presentación. Los cambios se pierden al reiniciar.
const seed = require('./data')

// Usuario administrador de prueba
const demoUser = {
    _id: 'demo-admin',
    id: 'demo-admin',
    name: 'Admin Ecommerce de prueba',
    email: 'admin@demo.com',
    password: 'demo1234'
}

// Copia mutable de los datos de ejemplo
let products = seed.products.map(p => ({ ...p, image: { ...p.image } }))
let categories = seed.categories.map(c => ({ ...c }))

let sequence = 100
const nextId = (prefix) => `${prefix}-${++sequence}`

const capitalize = (text) =>
    String(text).charAt(0).toUpperCase() + String(text).slice(1).toLowerCase()

// ---- Productos ----
const getProducts = () => products
const findProduct = (id) => products.find(p => p._id === id)

const createProduct = ({ title, description, category, price }) => {
    const _id = nextId('prod')
    const product = {
        _id,
        title,
        description,
        category,
        price: Number(price) || 0,
        user: demoUser._id,
        // La imagen se genera como SVG a partir del título
        image: { public_id: _id, secure_url: `/demo/img/${_id}.svg` }
    }
    products.push(product)
    return product
}

const updateProduct = (id, { title, description, category, price }) => {
    const product = findProduct(id)
    if (!product) return null

    if (title !== undefined) product.title = title
    if (description !== undefined) product.description = description
    if (category !== undefined) product.category = category
    if (price !== undefined && price !== '') product.price = Number(price) || 0
    return product
}

const deleteProduct = (id) => {
    products = products.filter(p => p._id !== id)
}

// ---- Categorías ----
const getCategories = () => categories
const findCategory = (id) => categories.find(c => c._id === id)

const categoryNameTaken = (name, exceptId) =>
    categories.some(c => c.name.toLowerCase() === String(name).toLowerCase() && c._id !== exceptId)

const createCategory = ({ name, imageUrl }) => {
    const _id = nextId('cat')
    const category = {
        _id,
        name: capitalize(name),
        imageUrl: imageUrl || `/demo/img/${_id}.svg`
    }
    categories.push(category)
    return category
}

const updateCategory = (id, { name, imageUrl }) => {
    const category = findCategory(id)
    if (!category) return null

    const previousName = category.name
    category.name = capitalize(name)
    if (imageUrl) category.imageUrl = imageUrl

    // Mantener la coherencia: los productos referencian la categoría por nombre
    if (previousName !== category.name) {
        products
            .filter(p => p.category === previousName)
            .forEach(p => { p.category = category.name })
    }
    return category
}

const deleteCategory = (id) => {
    categories = categories.filter(c => c._id !== id)
}

module.exports = {
    demoUser,
    getProducts,
    findProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    findCategory,
    categoryNameTaken,
    createCategory,
    updateCategory,
    deleteCategory
}
