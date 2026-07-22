// Carga inicial de la base de datos.
//
// Crea el usuario administrador (ya confirmado, porque sin servicio de correo
// no hay forma de confirmarlo desde la web) y, si la tienda está vacía, las
// categorías y productos de ejemplo.
//
// Uso:  npm run seed
require('dotenv').config()

const mongoose = require('mongoose')
const User = require('../models/User')
const Category = require('../models/Category')
const Portfolio = require('../models/Portfolio')
const seedData = require('../demo/data')
const { generatedProductImage, generatedCategoryImage } = require('../config/generated-image')
const { hasCloudinary } = require('../demo/mode')

// Credenciales del administrador: se pueden cambiar por variables de entorno
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@demo.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'demo1234'

const crearAdministrador = async () => {
    const existente = await User.findOne({ email: ADMIN_EMAIL })

    if (existente) {
        // Reaplicar la contraseña y la confirmación deja el script repetible:
        // si te quedaste fuera, volver a correrlo restaura el acceso
        existente.name = ADMIN_NAME
        existente.password = await existente.encrypPassword(ADMIN_PASSWORD)
        existente.confirmEmail = true
        existente.token = null
        await existente.save()
        console.log(`✔ Administrador actualizado: ${ADMIN_EMAIL}`)
        return existente
    }

    const admin = new User({ name: ADMIN_NAME, email: ADMIN_EMAIL })
    admin.password = await admin.encrypPassword(ADMIN_PASSWORD)
    admin.confirmEmail = true
    await admin.save()
    console.log(`✔ Administrador creado: ${ADMIN_EMAIL}`)
    return admin
}

const crearCatalogo = async (admin) => {
    const categoriasExistentes = await Category.countDocuments()
    const productosExistentes = await Portfolio.countDocuments()

    if (categoriasExistentes || productosExistentes) {
        console.log(`↷ La tienda ya tiene datos (${categoriasExistentes} categorías, ${productosExistentes} productos): no se toca el catálogo`)
        return
    }

    // Las categorías se guardan primero porque los productos las referencian
    // por nombre. Ojo: el modelo normaliza el nombre al guardar
    // ("Categoría A" -> "Categoría a"), así que hay que quedarse con el nombre
    // ya guardado o los productos no aparecerían en la tienda.
    const nombreGuardado = new Map()
    for (const categoria of seedData.categories) {
        const nueva = new Category({ name: categoria.name, imageUrl: 'pendiente' })
        nueva.imageUrl = generatedCategoryImage(nueva._id)
        await nueva.save()
        nombreGuardado.set(categoria.name, nueva.name)
    }
    console.log(`✔ ${seedData.categories.length} categorías creadas`)

    for (const producto of seedData.products) {
        const nuevo = new Portfolio({
            title: producto.title,
            description: producto.description,
            category: nombreGuardado.get(producto.category) || producto.category,
            price: producto.price,
            user: admin._id
        })
        // Con Cloudinary configurado los productos de ejemplo se quedan sin
        // imagen propia: se espera que subas las tuyas desde el panel
        nuevo.image = hasCloudinary
            ? { public_id: '', secure_url: '' }
            : generatedProductImage(nuevo._id)
        await nuevo.save()
    }
    console.log(`✔ ${seedData.products.length} productos creados`)
}

const main = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('✖ Falta MONGODB_URI. Créalo en el archivo .env antes de ejecutar la carga inicial.')
        process.exit(1)
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✔ Conectado a MongoDB')

        const admin = await crearAdministrador()
        await crearCatalogo(admin)

        console.log('\nListo. Entra con:')
        console.log(`   Correo:     ${ADMIN_EMAIL}`)
        console.log(`   Contraseña: ${ADMIN_PASSWORD}`)
    } catch (error) {
        console.error('✖ Error en la carga inicial:', error.message)
        process.exitCode = 1
    } finally {
        await mongoose.disconnect()
    }
}

main()
