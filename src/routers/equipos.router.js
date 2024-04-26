import { Router } from 'express'
//import {v4 as uuidv4} from 'uuid'
import { Equipomodel } from '../models/equipo.model.js'
import { DateTime } from 'luxon'
import formateaResultados from '../utils.js'
const equiposRouter = Router()

const ahora = DateTime.now()
let fechaActual = ahora.toISODate()  //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').

//CONSULTAR POR SERIE:
equiposRouter.get('/:serie', async (req, res) => {     //api/equipos/serie
  let elegido = req.equipoElegido
  let equipo = elegido  
  const serie = req.params.serie      //obtenemos el serie pedido
  try {     
    const resultados = await Equipomodel.find({ serie }).sort({ _id: -1 })    //consultamos el modelo y por tanto la base de datos. ordenamos de mayor a menor (nuevos a antiguos)
    if (resultados.length == 0) { console.log("No se encontró ningún dato ☹") }
    const equipos = formateaResultados(resultados)
    //NO se pueden llamar a partials desde aquí. siempre a los views. los renders siempre manejan páginas completas.
    //actualizamos la página y llenamos la tabla
    res.render('index', {
      equipos,
      serie,
      fechaActual,
      mostrarHistorial: true,
      equipo,
     // busqueda: elegido, devería ponerlo ???
    })  //estas son variables de Handlebars para la TABLA
    res.status(200)
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
  }
})


//Los VALUE de los INPUTS también pueden ser modificados con {{variable}}
//PERO NO PUEDEN SER LEÍDOS DESDE EL SERVIDOR, sólo desde el cliente con JS

//CREAR NUEVO
equiposRouter.post('/', async (req, res) => {
  const { body } = req                                         //obtengo sólo el body
  console.log("Post hacia api/equipos: " + body.serie)
  try {
    const nuevo = await Equipomodel.create(body)      //creamos un nuevo registro. sólo si cumple los requerimientos del esquema.   
    //console.log(nuevo)
    const serie = body.serie
    res.redirect('equipos/' + serie)     //redirigimos al serie recién agregado. no poner / al principio.
    res.status(201)  //funciona ok. si no respondemos con 201 el navegador se queda pensando...y hay que responder con algo
  }
  catch (err) {
    console.log("Error creando equipo. faltan datos: ", err.message)
    res.render('index', { serie })   // y si HAY UN ERROR hay que responder con algo. si no se queda PENSANDO.
    //res.json({Error: id, mensage: err.message}) CUIDADO PRIMERO EL STATUS. LUEGO EL JSON
    res.status(400)       // NO ALCANZA con responder un status.
  }
})

//Formulario para EDITAR: 
equiposRouter.get('/edit/:id', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const id = req.params.id
  //console.log('Editar recibido: ' + id)
  try {

    // traer los datos de la base de datos
    const datos = await Equipomodel.findById(id)
    //console.log(datos)
    //completar el formulario
    const equipo = datos.equipo
    const serie = datos.serie
    fechaActual = datos.fecha
    const linea = datos.linea
    const coche = datos.coche
    const problema = datos.problema
    const caso = datos.caso

    // aquí renderizamos un VIEW con formulario de EDICION:
    res.render('formEdit', {
      equipo, serie, id, fechaActual,
      linea, coche, caso, problema,
    })
    res.status(200)  //303 para que no permita volver una página atrás.
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
})

//ACTUALIZAR
equiposRouter.put('/actualizar/:id', async (req, res) => {
  const id = req.params.id
  const serie = req.body.serie
  console.log("Actualizando: ", id)
  try {
    const datosFormulario = req.body
    // console.log(datosFormulario)

    const resultado = await Equipomodel.findByIdAndUpdate(id, datosFormulario, { new: true })
    if (!resultado) {
      console.log('No se encontró el ID')
      return res.status(404).json({ msg: 'No se encontró el equipo para actualizar.' });
    }
    res.json({ msg: 'se actualizó :', id: id })
    //res.redirect('validadores/' + serie) 
    res.status(200)
  }
  catch (error) {
    console.log('Error al actualizar el equipo: ', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el equipo.' })
  }
})
//.then(response => {   //ESTA SERÍA LA FORMA de REDIRIGIR desde el SERVIDOR sin que lo haga el FETCH del cliente.
//  if (response.ok) {  
//    // Si la actualización se realiza correctamente, verificar si hay redirección
//    if (response.redirected) {
//      // Realizar la acción adecuada, como cargar la nueva página
//      window.location.href = response.url;

//BORRAR
equiposRouter.delete('/delete/:id', async (req, res) => {   //'/equipos/:id'
  //res.render('popup')
  try {
    const id = req.params.id
    const { body } = req
    console.log('Borrando: ' + body.id + body.serie)
    const result = await Equipomodel.findByIdAndDelete(id)
    if (!result) {
      // El documento no fue encontrado para eliminar
      return res.status(404).json({ error: 'El equipo no fue encontrado.' });
    }
    //no se puede responder dos veces
    res.status(200)
    res.json({ msg: 'se eliminó :', id: id })        //responder de esta forma permite ver los mensajes en la CONSOLA del CLIENTE (si lo capturamos con JS)
    //res.redirect('/api/validadores/' + body.serie)  //la ruta es correcta pero no sé porque FALLA
    //VOY a manejar la redirección a la página desde el CLIENTE
    // NUEVO: res.redirect(req.get('referer')) ESTO PODRÍA SOLUCIONARLO. hay varios métodos de redirección.
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
})



export default equiposRouter       //para importar en app.js
