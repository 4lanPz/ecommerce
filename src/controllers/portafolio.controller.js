
// Importar el modelo
const Portfolio = require('../models/Portfolio')
// Importar el método
const { uploadImage, deleteImage } = require('../config/cloudinary')
// Importar fs
const fs = require('fs-extra')
// Importar el modelo Category
const Category = require('../models/Category')
// Capacidades disponibles
const { isDemo, hasCloudinary } = require('../demo/mode')
const store = require('../demo/store')
const { generatedProductImage } = require('../config/generated-image')



// MÉTODO PARA LISTAR LOS PORTAFOLIOS
const renderAllPortafolios = async(req,res)=>{
    if (isDemo) {
        return res.render("portafolio/allPortfolios", {
            portfolios: store.getProducts(),
            categories: store.getCategories()
        })
    }
    // Se listan todos los productos de la tienda, no solo los del usuario que
    // inició sesión: el panel es de administración, no un portafolio personal
    const portfolios = await Portfolio.find().lean()
    const categories = await Category.find().lean();
    // Invoocar a la vista y mandar la variable
    res.render("portafolio/allPortfolios",{portfolios, categories})
}




// MÉTODO PARA LISTAR EL DETALLE DE UN PORTAFOLIO
const renderPortafolio = (req,res)=>{
    res.send('Mostrar el detalle de un portafolio')
}






// MÉTODO PARA MOSTRAR EL FORMULARIO
const renderPortafolioForm = async (req,res)=>{
    if (isDemo) {
        return res.render('portafolio/newFormPortafolio', { categories: store.getCategories() })
    }
    const categories = await Category.find().lean();
    // INVOCACIÓN DE LA VISTA
    res.render('portafolio/newFormPortafolio', {categories})
}

// MÉTODO PARA GUARDAR EN LA BDD LO CAPTURADO EN EL FORM
const createNewPortafolio = async (req,res)=>{
    // En modo demo no se sube imagen: se genera un SVG a partir del título
    if (isDemo) {
        const { title, description, category, price } = req.body
        if (!title || !category) return res.send("Se requiere el nombre y la categoría")
        store.createProduct({ title, description, category, price })
        return res.redirect('/portafolios')
    }

    // Crear una nueva instancia del Portafolio
    const newPortfolio = new Portfolio(req.body)
    // Asociar el usuario que inicia sesión al portafolio
    newPortfolio.user = req.user._id

    if (hasCloudinary) {
        // Validar la imágen
        if(!(req.files?.image)) return res.send("Se requiere una imagen")
        // Invocar el método para que se almacene en cloudinary
        const imageUpload = await uploadImage(req.files.image.tempFilePath)
        newPortfolio.image = {
            public_id:imageUpload.public_id,
            secure_url:imageUpload.secure_url
        }
        // Eliminar los archivos temporales
        await fs.unlink(req.files.image.tempFilePath)
    } else {
        // Sin Cloudinary la imagen se genera a partir del nombre del producto
        newPortfolio.image = generatedProductImage(newPortfolio._id)
    }

    // Almacenar en la BDD
    await newPortfolio.save()
    res.redirect('/portafolios')
}









// MÉTODO PARA MOSTRAR EL FORMULARIO PARA ACTUALIZAR
const renderEditPortafolioForm = async(req,res)=>{
    if (isDemo) {
        const portfolio = store.findProduct(req.params.id)
        if (!portfolio) return res.redirect('/portafolios')
        return res.render('portafolio/editPortfolio', {
            portfolio,
            categories: store.getCategories()
        })
    }
    // Cargar la información de los productos y convertir en un json
    const portfolio = await Portfolio.findById(req.params.id).lean()
    // Cargar la información de las categorias
    const categories = await Category.find().lean();
    // Invocar la vista y pasar la variable
    res.render('portafolio/editPortfolio',{portfolio, categories})
}



// MÉTODO PARA ACTUALIZAR EN LA BDD LO CAPTURADO EN EL FORM
const updatePortafolio = async(req,res)=>{
    if (isDemo) {
        store.updateProduct(req.params.id, req.body)
        return res.redirect('/portafolios')
    }

    const portfolio = await Portfolio.findById(req.params.id).lean()
    if(portfolio._id != req.params.id) return res.redirect('/portafolios')

    // Verificar si el usuario quiere actualizar la imagen o solo los campos extras
    // (sin Cloudinary no hay campo de imagen: se conserva la generada)
    if(hasCloudinary && req.files?.image) {
        await deleteImage(portfolio.image.public_id)
        const imageUpload = await uploadImage(req.files.image.tempFilePath)
        const data ={
            title:req.body.title || portfolio.name,
            category: req.body.category || portfolio.category,
            description:req.body.description || portfolio.description,
            price: req.body.price || portfolio.price,
            image : {
            public_id:imageUpload.public_id,
            secure_url:imageUpload.secure_url
            }
        }
        await fs.unlink(req.files.image.tempFilePath)
        await Portfolio.findByIdAndUpdate(req.params.id,data)
    }
    else{
        const {title,category,description,price}= req.body
        await Portfolio.findByIdAndUpdate(req.params.id,{title,category,description,price})
    }
    res.redirect('/portafolios')
}








// MÉTODO PARA ELIMINAR EN LA BDD
const deletePortafolio = async(req,res)=>{
    if (isDemo) {
        store.deleteProduct(req.params.id)
        return res.redirect('/portafolios')
    }

    // Utilizar el método findByIdAndDelete
    const portafolio = await Portfolio.findByIdAndDelete(req.params.id)
    // Solo hay imagen que borrar si se subió a Cloudinary
    if (hasCloudinary && portafolio?.image?.public_id) {
        await deleteImage(portafolio.image.public_id)
    }
    res.redirect('/portafolios')
}










// EXPORTAR LAS FUNCIONES
module.exports ={
    renderAllPortafolios,
    renderPortafolio,
    renderPortafolioForm,
    createNewPortafolio,
    renderEditPortafolioForm,
    updatePortafolio,
    deletePortafolio
}
