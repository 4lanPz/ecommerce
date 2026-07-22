
// Importación del modelo 
const User = require('../models/User')

// Importación de passport
const passport = require("passport")

// Importar el método sendMailToUser
const { sendMailToUser, sendMailToRecoveryPassword } = require("../config/nodemailer")

// El correo es opcional: sin Mailtrap las cuentas quedan confirmadas y la
// recuperación de contraseña se desactiva en lugar de fallar con un error 500
const { hasMail } = require("../demo/mode")





// Método es para mostrar el fomrulario de regsitro
const renderRegisterForm =(req,res)=>{
    res.render('user/registerForm')
}

// Método es para capturar la información del formulario y almacenar en bdd
const registerNewUser = async(req,res)=>{
    // Obtener los datos del req.body
    const{name,email,password,confirmpassword} = req.body
    // Validar si todos los campos están llenos
    if (Object.values(req.body).includes("")) return res.send("Lo sentimos, debes llenar todos los campos")
    // Validar las contraseñas

    if(password != confirmpassword) return res.send("Lo sentimos, las credenciales son incorrectas")

    // Consulta a la BDD para ontener un usuario en base al email
    const userBDD = await User.findOne({email})
    // Verificar si el usuario ya se encuentra registrado
    if(userBDD) return res.send("Lo sentimos, el email ya se encuentra registrado")
    // Crear una nueva instancia para registrar un nuevo usuario
    const newUser = await new User({name,email,password,confirmpassword})
    // Encriptrar el password
    newUser.password = await newUser.encrypPassword(password)

    if (hasMail) {
        // Establecer el token
        const token = newUser.crearToken()
        // Enviar el correo electrónico
        sendMailToUser(email,token)
    } else {
        // Sin servicio de correo no hay forma de confirmar la cuenta, así que la
        // damos por confirmada: de lo contrario nadie podría iniciar sesión
        newUser.confirmEmail = true
    }

    // Guardar en BDD
    await newUser.save()
    // Redireccionar a la vista login
    res.redirect('/user/login')
}


// Método para confirmar el email
const confirmEmail = async(req,res)=>{
    // Validar si existe el token 
    if(!(req.params.token)) return res.send("Lo sentimos, no se puede validar la cuenta")
    // Obtener el usuario en base al token
    const userBDD = await User.findOne({token:req.params.token})
    // Verificar si el usuario existe
    if (!userBDD) {
        return res.send("Lo sentimos, el token proporcionado no es válido");
    }
    // Establecer el token y confirmar el email
    userBDD.token = null
    userBDD.confirmEmail = true
    await userBDD.save()
    res.send('Token confirmado, ya puedes iniciar sesión');
}






// Método es para mostrar el fomrulario de login
const renderLoginForm =(req,res)=>{
    // Mensaje dejado por passport cuando el intento anterior falló
    const [message] = req.flash('error')
    res.render('user/loginForm', message ? { message, messageType: 'danger' } : {})
}
// Middleware personalizado para verificar campos obligatorios
const checkRequiredFields = (req, res, next) =>{
    if (!req.User || req.User.requiredField1 || !req.User.requiredField2){
        return res.redirect('/user/portafolios');
    }
    next();
}
// Middleware combinado para autenticación y verificación de campos obligatorios
const loginAndCheckFields = (req, res, next) => {
    loginUser(req, res, (err) => {
        if (err) return next(err);
        checkRequiredFields(req, res, next);
    });
};

// Método para realizar en inicio de sesión con los datos del form
const loginUser = passport.authenticate('local',{
    // Si todo sale mal - redireccionar al login mostrando el motivo
    failureRedirect:'/user/login',
    failureFlash: true,
    // Si todo sale bien - redirecccionar a la vista de portafolios
    successRedirect:'/portafolios'
})

// Método para realizar el cierre de sesión
const logoutUser =(req,res)=>{

    req.logout((err)=>{
        if (err) return res.send("Ocurrio un error") 
        res.redirect('/');
    });
    
}

const renderForgotPassword = (req, res)=>{
    res.render('user/forgotPasswordForm');
}

const forgotPassword = async (req, res)=>{
    const { email } =req.body;

    // Sin servicio de correo no se puede enviar el enlace: se avisa en lugar de
    // reventar con un error 500
    if (!hasMail) return res.render('user/forgotPasswordForm', {message: "La recuperación de contraseña necesita el servicio de correo configurado",messageType: 'danger'});

    if (Object.values(req.body).includes("")) return res.render('user/forgotPasswordForm', {message: "Lo sentimos, debe llenar todos los campos",messageType: 'danger'});

    const userBD = await User.findOne({ email: email.toLocaleLowerCase()});
    
    if(!userBD) return res.render('user/forgotPasswordForm', {message:"Lo sentimos, el usuario no se encuentra registrado",messageType: 'danger'});
    const token = userBD.crearToken();

    userBD.token = token;

    // Enviar el correo para recuperar la contraseña
    await sendMailToRecoveryPassword(email, token);

    await userBD.save();
    res.render('user/loginForm', {message:"Revisa tu correo electrónico para reestablecer tu cuenta", messageType: 'success'});
}

const checkTokenPasswordRender = async (req, res) => {
    if(!(req.params.token)) return res.render('user/recoveryPasswordForm', { message: 'Lo sentimos, no se puede validar la cuenta o ya ha sido validada', messageType: 'danger' });

    const userBD = await User.findOne({ token: req.params.token});
    if(userBD?.token !== req.params.token) return res.render('user/recoveryPasswordForm', { message: 'Lo sentimos, no se puede validar la cuenta o ya ha sido validada', messageType: 'danger' });

    await userBD.save();
    const token = req.params.token;
    //res.send('Token confirmado, ya puedes crear tu nueva contraseña');
    return res.render('user/recoveryPasswordForm', { token, message: 'Token confirmado, ya puedes crear tu nueva contraseña', messageType: 'success' });
}

const newPassword = async (req, res) =>{
    const { password, confirmpassword} = req.body;
    const token =req.params.token;
    if (Object.values(req.body).includes("")) return res.render('user/recoveryPasswordForm', {token, message:"Lo sentimos, debes llenar todos los campos", messageType: 'danger' });

    if(password != confirmpassword) return res.render('user/recoveryPasswordForm', {token, message:"Lo sentimos, las contraseñas no coinciden", messageType: 'danger' });

    const userBD = await User.findOne({token: req.params.token});

    if(userBD?.token !== req.params.token) return res.render('user/recoveryPasswordForm', {token, message:"Lo sentimos, no se puede validar la cuenta", messageType: 'danger' });

    userBD.token = null;
    userBD.password = await userBD.encrypPassword(password);

    await userBD.save();

    res.render('user/loginForm', {message:"Felicidades, ya puede iniciar sesión con tu nueva contraseña", messageType: 'success'});
}

// Exportación de los métodos (controladores)
module.exports={
    renderRegisterForm,
    registerNewUser,
    renderLoginForm,
    renderForgotPassword,
    loginUser,
    logoutUser,
    confirmEmail,
    forgotPassword,
    checkTokenPasswordRender,
    newPassword,
    loginAndCheckFields 
}
