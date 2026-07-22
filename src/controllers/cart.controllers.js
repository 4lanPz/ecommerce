const Order = require('../models/Orders');
const {sendOrderConfirmation} = require('../config/nodemailer');
const User = require('../models/User')
const { hasDatabase, hasMail } = require('../demo/mode')


// Metodo para procesar la orden y enviar el correo
const processOrder = async (req, res) => {
    try {
        const { user, items, total } = req.body;

        // Sin base de datos la orden no se guarda: se registra en consola para
        // poder mostrarla durante la presentación
        if (!hasDatabase) {
            console.log('▶ [DEMO] Pedido recibido:', JSON.stringify({ user, items, total }, null, 2));
            return res.status(200).json({ message: 'Orden procesada (modo demo)' });
        }

        // Crear la orden en la base de datos
        const newOrder = new Order({ user, items, total });
        // Guardar
        await newOrder.save();

        // El correo es opcional: si Mailtrap no está configurado la compra se
        // completa igual. Un fallo al notificar tampoco debe tumbar el pedido,
        // que ya quedó guardado.
        if (hasMail) {
            try {
                const usersBDD = await User.find().lean();
                const adminEmails = usersBDD.map(user => user.email)
                await sendOrderConfirmation(user, items, adminEmails);
            } catch (mailError) {
                console.error('El pedido se guardó, pero falló el correo:', mailError.message);
            }
        } else {
            console.log('▶ Pedido guardado:', JSON.stringify({ user, items, total }, null, 2));
        }

        res.status(200).json({ message: 'Orden procesada' });
    } catch (error) {
        res.status(500).json({ message: `Error procesando la orden ${error}` });
    }
};

module.exports = {
    processOrder
};
