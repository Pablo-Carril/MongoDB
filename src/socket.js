import { Server } from 'socket.io' 

export const initsocket = (httpServer) => {
    const socketServer = new Server(httpServer)    //creamos un server Websocket

    socketServer.on ('connection', (socketClient) => {       //manejamos el evento connection. socketClient es un objeto que nos trae toda la info del cliente conectado
        console.log(`Nuevo cliente socket conectado id: ${socketClient.id}`)
        socketClient.on('message', (msg)=> {
            console.log('cliente envió un mensaje: ' + msg)
        })

        socketClient.emit('init',"Hola desde el server")   //cada cliente tiene su propio objeto socketClient. sabe a quíen contestar.

        })       
   }

