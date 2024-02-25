const socket = io()              //creamos un objeto socket a travéz de io(). esto permite que se conecte al servidor.

socket.emit('message', 'Hola desde el cliente websocket')

socket.on('init', (data) => {
    console.log("recibido: " + data)
})
