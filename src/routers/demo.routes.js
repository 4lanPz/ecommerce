// Genera las imágenes de productos y categorías como SVG, para no depender de
// Cloudinary ni de internet. Funciona igual con o sin base de datos: busca el
// elemento donde corresponda y dibuja su nombre.
const { Router } = require('express')
const store = require('../demo/store')
const { hasDatabase } = require('../demo/mode')
const Portfolio = require('../models/Portfolio')
const Category = require('../models/Category')

const router = Router()

// Paleta suave, coherente con una tienda de belleza
const palettes = [
    ['#f7d6e0', '#c98da8'],
    ['#e0d9f7', '#9d8ec9'],
    ['#d6eef7', '#8dbac9'],
    ['#f7ead6', '#c9a98d'],
    ['#dcf7d6', '#93c98d']
]

// Escapar texto para incrustarlo en el SVG sin romper el marcado
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[char]))

// Partir el título en líneas para que quepa en la imagen
const wrap = (text, maxChars) => {
    const lines = []
    let line = ''
    for (const word of String(text).split(' ')) {
        if ((line + ' ' + word).trim().length > maxChars && line) {
            lines.push(line.trim())
            line = word
        } else {
            line = (line + ' ' + word).trim()
        }
    }
    if (line) lines.push(line)
    return lines.slice(0, 3)
}

const buildSvg = (label, seed) => {
    const [light, dark] = palettes[seed % palettes.length]
    const lines = wrap(label, 18)
    // Centrar verticalmente el bloque de texto
    const startY = 300 - ((lines.length - 1) * 26)
    const text = lines.map((line, i) =>
        `<text x="400" y="${startY + i * 52}" text-anchor="middle" font-family="Montserrat, Segoe UI, sans-serif" font-size="42" font-weight="700" fill="#ffffff">${escape(line)}</text>`
    ).join('')

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img" aria-label="${escape(label)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="660" cy="140" r="90" fill="#ffffff" opacity="0.18"/>
  <circle cx="130" cy="480" r="130" fill="#ffffff" opacity="0.12"/>
  ${text}
  <text x="400" y="540" text-anchor="middle" font-family="Lato, Segoe UI, sans-serif" font-size="20" letter-spacing="4" fill="#ffffff" opacity="0.75">IMAGEN DEMO</text>
</svg>`
}

// Color estable a partir del identificador, sin depender de la posición en la
// lista (los ids de MongoDB no son índices)
const seedFrom = (id) => {
    let hash = 0
    for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) % 100000
    return hash
}

// Buscar el nombre a dibujar, venga de la base de datos o del almacén en memoria
const findLabel = async (slug) => {
    if (!hasDatabase) {
        const product = store.getProducts().find(p => p._id === slug)
        if (product) return product.title
        const category = store.getCategories().find(c => c._id === slug)
        return category ? category.name : null
    }

    // Un id inválido no es un error: simplemente no existe esa imagen
    if (!slug.match(/^[a-f\d]{24}$/i)) return null

    const product = await Portfolio.findById(slug).lean()
    if (product) return product.title
    const category = await Category.findById(slug).lean()
    return category ? category.name : null
}

router.get('/demo/img/:slug.svg', async (req, res) => {
    const { slug } = req.params

    try {
        const label = await findLabel(slug)
        if (!label) return res.status(404).send('Imagen no encontrada')

        res.type('image/svg+xml')
        res.send(buildSvg(label, seedFrom(slug)))
    } catch (error) {
        console.error('Error generando la imagen:', error.message)
        res.status(500).send('Error generando la imagen')
    }
})

module.exports = router
