// Importar passport
const passport = require('passport')
// Importar el modelo
const User = require('../models/User')
// Modo demo
const { isDemo } = require('../demo/mode')
const { demoUser } = require('../demo/store')


// Establecer la estrategia
const LocalStrategy = require('passport-local').Strategy


// En modo demo se valida contra un usuario de prueba, sin base de datos
if (isDemo) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        // done(null, false) hace que passport use failureRedirect en lugar de
        // lanzar un error 500 como haría done('mensaje')
        if (email !== demoUser.email || password !== demoUser.password) {
            return done(null, false, { message: 'Credenciales incorrectas' })
        }
        return done(null, demoUser)
    }))

    passport.serializeUser((user, done) => done(null, user._id))
    passport.deserializeUser((id, done) => done(null, id === demoUser._id ? demoUser : null))

    module.exports = passport
    return
}


// Configuración de la estrategia
passport.use(new LocalStrategy({
    usernameField:'email',
    passwordField:'password'
},async(email,password,done)=>{

    // El primer argumento de done() es un error del servidor: pasar ahí un
    // mensaje de validación provoca un 500. Los rechazos van como
    // done(null, false, {message}), que redirige al login mostrando el aviso.

    // Consulta a la BDD para obtener el usuario en base al email
    const userBDD = await User.findOne({email})
    // Verificar si existe el usuario
    if(!userBDD) return done(null,false,{message:"Lo sentimos, el email no se encuentra registrado"})
    // Verificar la contraseña del form vs bdd
    const passwordUser = await userBDD.matchPassword(password)
    // verificar si coinciden
    if(!passwordUser) return done(null,false,{message:"Lo sentimos, los passwords no coinciden"})
    // Validar si el usuario puede iniciar sesión si y solo si ha confirmado su cuenta de correo electrónico
    if(userBDD.confirmEmail===false) return done(null,false,{message:"Lo sentimos, debe verificar la cuenta en su correo electrónico"})

    // Mandar el usuario
    return done(null,userBDD)
}))





// Realizar el proceso de serializar el usuario 
passport.serializeUser((user,done)=>{
    done(null,user.id)
})


// Realizar el proceso de deserealizar el usuario
passport.deserializeUser(async (id, done) => {
    const userDB  = await User.findById(id).exec();
    return done(null,userDB)
});