import dotenv from 'dotenv'
dotenv.config()


//CUIDADO:  ****   YA NO USO MAS ESTE ARCHIVO SERVER 17/04/24  *******  TODO se maneja ahora desde APP.JS   ********

import http from 'http'
import app from './app.js'
//import {initsocket} from './socket.js'   //NO voy a usar Sockets por ahora
import {initdb} from './db/mongodb.js'

const server = http.createServer(app)
const PORT = process.env.PORT

//initsocket (server)        //NO voy a usar Sockets por ahora

await initdb()    //el await solitario es posible con módulos.

server.listen(PORT, ()=> { console.log(`servidor corriendo en PUERTO: ${PORT}`) })

