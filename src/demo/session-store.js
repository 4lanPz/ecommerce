// Almacén de sesiones en archivo, para el modo demo.
//
// Por defecto express-session usa MemoryStore: las sesiones viven en la RAM del
// proceso. Cada reinicio del servidor (nodemon al guardar un archivo) las borra,
// así que la cookie del navegador queda apuntando a una sesión que ya no existe
// e isAuthenticated() redirige al login a media presentación.
//
// Guardarlas en disco hace que la sesión sobreviva a los reinicios. Es un JSON
// en el directorio temporal del sistema, no toca el repositorio.
const fs = require('fs')
const os = require('os')
const path = require('path')
const { Store } = require('express-session')

const FILE = path.join(os.tmpdir(), 'ecommerce-demo-sessions.json')

// Leer todas las sesiones, descartando las caducadas.
// Si el archivo no existe o quedó corrupto se empieza de cero: es una demo,
// perder las sesiones no es un error que valga la pena propagar.
const readAll = () => {
    let sessions
    try {
        sessions = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    } catch {
        return {}
    }

    const now = Date.now()
    for (const [sid, session] of Object.entries(sessions)) {
        const expires = session?.cookie?.expires
        if (expires && new Date(expires).getTime() <= now) delete sessions[sid]
    }
    return sessions
}

const writeAll = (sessions) => {
    try {
        fs.writeFileSync(FILE, JSON.stringify(sessions))
    } catch (error) {
        console.error('No se pudieron guardar las sesiones de la demo:', error.message)
    }
}

class FileSessionStore extends Store {
    get(sid, callback) {
        callback(null, readAll()[sid] || null)
    }

    set(sid, session, callback) {
        const sessions = readAll()
        sessions[sid] = session
        writeAll(sessions)
        callback(null)
    }

    destroy(sid, callback) {
        const sessions = readAll()
        delete sessions[sid]
        writeAll(sessions)
        callback(null)
    }

    // express-session llama a touch para renovar la caducidad en cada request
    touch(sid, session, callback) {
        const sessions = readAll()
        if (sessions[sid]) {
            sessions[sid].cookie = session.cookie
            writeAll(sessions)
        }
        callback(null)
    }
}

module.exports = FileSessionStore
