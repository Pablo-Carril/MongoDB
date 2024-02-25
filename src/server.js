import http from 'http'
import app from './app.js'
//import {initsocket} from './socket.js'   //NO voy a usar Sockets por ahora
import {initdb} from './db/mongodb.js'

const server = http.createServer(app)
const PORT = 8090

//initsocket (server)        //NO voy a usar Sockets por ahora

await initdb()    //el await solitario es posible con módulos.

server.listen(PORT, ()=> { console.log(`servidor corriendo en PUERTO: ${PORT}`) })

