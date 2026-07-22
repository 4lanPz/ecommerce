// Importar el modelo Category
const Category = require('../models/Category')
// Importar el modelo Portfolio (los productos guardan el nombre de su categoría)
const Portfolio = require('../models/Portfolio')
// Capacidades disponibles
const { isDemo } = require('../demo/mode')
const store = require('../demo/store')
const { generatedCategoryImage } = require('../config/generated-image')

// MÉTODO PARA LISTAR LAS CATEGORIAS
const renderAllCategorias = async (req, res) => {
    if (isDemo) {
        return res.render("categorie/allCategories", { categories: store.getCategories() })
    }
    const categories = await Category.find().lean();
    // Invoocar a la vista y mandar la variable
    res.render("categorie/allCategories", { categories })
}

// MÉTODO PARA MOSTRAR EL FORMULARIO
const renderCategorieForm = async (req, res) => {
    const error = req.query.error;
    // INVOCACIÓN DE LA VISTA
    res.render('categorie/newFormCategorie', { error })
}

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// MÉTODO PARA GUARDAR EN LA BDD LO CAPTURADO EN EL FORM
const createNewCategorie = async (req, res) => {
    const { name, imageUrl } = req.body;
    const formattedName = capitalizeFirstLetter(name);// Primera letra en mayuscula las demas en minuscula

    if (isDemo) {
        if (store.categoryNameTaken(formattedName)) {
            return res.redirect('/categorie/add?error=Nombre de la categoría ya existe');
        }
        store.createCategory({ name, imageUrl })
        return res.redirect('/categories')
    }

    // Comprobar si la categoría ya existe (comparar en minúsculas)
    const categoryExists = await Category.findOne({ name: new RegExp(`^${formattedName}$`, 'i') });
    if (categoryExists) {
        return res.redirect('/categorie/add?error=Nombre de la categoría ya existe');
    }

    const newCategory = new Category({ name, imageUrl });
    // Sin URL propia se genera una imagen a partir del nombre de la categoría
    if (!imageUrl) newCategory.imageUrl = generatedCategoryImage(newCategory._id)
    await newCategory.save();
    res.redirect('/categories')
}

// MÉTODO PARA MOSTRAR EL FORMULARIO PARA ACTUALIZAR LA CATEGORIA
const renderEditCategorieForm = async (req, res) => {
    if (isDemo) {
        const category = store.findCategory(req.params.id)
        if (!category) return res.redirect('/categories')
        return res.render('categorie/editCategorie', { category })
    }
    // Cargar la información de las categorias
    const category = await Category.findById(req.params.id).lean();
    // Invocar la vista y pasar la variable
    res.render('categorie/editCategorie', { category })
}

// MÉTODO PARA ACTUALIZAR EN LA BDD LO CAPTURADO EN EL FORM
const updateCategorie = async (req, res) => {
    const categoryId = req.params.id;
    const { name, imageUrl } = req.body;

    const formattedName = capitalizeFirstLetter(name);

    if (isDemo) {
        if (store.categoryNameTaken(formattedName, categoryId)) {
            return res.render('categorie/editCategorie', {
                category: { _id: categoryId, name, imageUrl },
                errorMessage: 'Ya existe una categoría con ese nombre. Por favor, elige otro nombre.'
            });
        }
        store.updateCategory(categoryId, { name, imageUrl })
        return res.redirect('/categories')
    }

    const existingCategory = await Category.findOne({ _id: { $ne: categoryId }, name: formattedName });

    if (existingCategory) {
        // Si existe otra categoría con el mismo nombre, mostrar mensaje de error
        return res.render('categorie/editCategorie', {
            category: { _id: categoryId, name, imageUrl },
            errorMessage: 'Ya existe una categoría con ese nombre. Por favor, elige otro nombre.'
        });
    }

    // Si el campo de imagen se deja vacío se conserva la que ya tenía,
    // en lugar de borrarla
    const changes = imageUrl ? { name: formattedName, imageUrl } : { name: formattedName }
    const previous = await Category.findByIdAndUpdate(categoryId, changes);

    // Los productos referencian la categoría por nombre: al renombrarla hay que
    // arrastrarlos, o dejarían de aparecer en la tienda
    if (previous && previous.name !== formattedName) {
        await Portfolio.updateMany({ category: previous.name }, { category: formattedName })
    }

    res.redirect('/categories')
}

// MÉTODO PARA ELIMINAR EN LA BDD
const deleteCategorie = async (req, res) => {
    if (isDemo) {
        store.deleteCategory(req.params.id)
        return res.redirect('/categories')
    }

    // Utilizar el método findByIdAndDelete
    await Category.findByIdAndDelete(req.params.id)
    res.redirect('/categories')
}

// EXPORTAR LAS FUNCIONES
module.exports = {
    renderAllCategorias,
    renderCategorieForm,
    createNewCategorie,
    renderEditCategorieForm,
    updateCategorie,
    deleteCategorie
}
