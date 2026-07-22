// Importación de express
const express = require('express')
// Importar path
const path = require('path');
// Importar handlebars
const { engine } = require('express-handlebars')
// Importar methodOverride
const methodOverride = require('method-override');
// Importar passport
const passport = require('passport');
// Importar session
const session = require('express-session');
// Importar fileUpload
const fileUpload = require('express-fileupload')

// Inicializaciones
const app = express()
require('./config/passport')

// Configuraciones 
app.set('port', process.env.port || 5000)
app.set('views', path.join(__dirname, 'views'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Establecer el directorio de las vistas
app.set('views', path.join(__dirname, 'views'))
// Configuraciones para el motor de plantilla
// 1 archivo master (master page)
// 2 establecer el directorio layouts
// 3 establecer el directorio partials
// 4 extensión de las páginas .hbs
app.engine('.hbs', engine({
    defaultLayout: 'main', // 1
    layoutsDir: path.join(app.get('views'), 'layouts'), // 2
    partialsDir: path.join(app.get('views'), 'partials'), // 3
    extname: '.hbs', // 4
    helpers:{
        eq: (a,b)=> a === b,
        // Formatear un precio como moneda: 24.9 -> $24.90
        money: (value)=> `$${Number(value || 0).toFixed(2)}`
    }
}))
// Establecer el motor de plantillas y su extensión
app.set('view engine', '.hbs')

// Configuraciones de fileUpload
app.use(fileUpload({
    // Establecer archivo temporales
    useTempFiles: true,
    // Especificar el directorio
    tempFileDir: '/tmp/'
}));



// Middlewares 
app.use(express.urlencoded({ extended: false })) // FORMULARIOS - VISTAS
app.use(methodOverride('_method'))
// Establecer la sesión del usuario
const { isDemo, hasDatabase, hasCloudinary } = require('./demo/mode')
const FileSessionStore = require('./demo/session-store')

// Las sesiones NUNCA deben quedarse en la memoria del proceso: al reiniciar el
// servidor (nodemon) o al cambiar de instancia (serverless en Vercel) la cookie
// del navegador queda huérfana y la app devuelve al login a media navegación.
//   - Con base de datos: se guardan en MongoDB, así funcionan en Vercel.
//   - Sin base de datos: se guardan en un archivo, así sobreviven a nodemon.
const sessionStore = hasDatabase
    ? require('connect-mongo').MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 8 * 60 * 60
    })
    : new FileSessionStore()

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    // 8 horas: suficiente para una presentación sin volver a iniciar sesión
    cookie: { maxAge: 8 * 60 * 60 * 1000 },
    store: sessionStore
}));
// Mensajes de un request al siguiente (por ejemplo, el motivo de un login fallido)
app.use(require('connect-flash')())
// Inicialización
app.use(passport.initialize())
// Mantener la sesión del usuario
app.use(passport.session())

// Variables globales
app.use((req, res, next) => {
    res.locals.user = req.user?.name || null
    // Precarga las credenciales de prueba en el login (solo sin base de datos)
    res.locals.isDemo = isDemo
    // Sin Cloudinary las imágenes se generan solas: los formularios ocultan el
    // campo de subir archivo y dejan de exigir una URL de imagen
    res.locals.generatedImages = !hasCloudinary
    next()
})

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// Rutas
app.use(require('./routers/demo.routes'))
app.use(require('./routers/index.routes'))
app.use(require('./routers/portafolio.routes'))
app.use(require('./routers/user.routes'))
app.use(require('./routers/compra.routes'))
app.use(require('./routers/cart.routes'))
app.use(require('./routers/categorie.routes'))

// Exportar la variable app
module.exports = app