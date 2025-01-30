import { Router } from 'express'
//import {v4 as uuidv4} from 'uuid'
import { Equipomodel } from '../models/equipo.model.js'
import { DateTime } from 'luxon'
import formateaFecha from '../utils.js'
import { inventario } from '../utils.js'
const equiposRouter = Router()

const hoy = () => {
  const ahora = DateTime.now()
  return ahora.toISODate()  //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').
}

//CONSULTAR por SERIE y mostrar HISTORIAL
equiposRouter.get('/:serie', async (req, res) => {     //api/equipos/serie
  let elegido = req.equipoElegido   //variable global que viene de un middleware
  let equipo = elegido
  const serie = req.params.serie     //obtenemos el serie pedido
  const { limit = 13, page = 1 } = req.query    // esto permite usar: /api/equipos/661?limit=3&page=2 y puse valores por defecto
  //
  if (equipo == 'todos') { elegido = '' }   //a veces viene como todos y a veces vacío, por el select. ok.
  try {
    const filtros = elegido === '' ? { serie: serie } : { $and: [{ equipo: elegido }, { serie: serie }] }
    const opciones = {
      page: parseInt(page),   //usamos parseInt para pasar a entero
      limit: parseInt(limit),
      sort: { fecha: -1, _id: -1 }
    }
    const consulta = await Equipomodel.paginate(filtros, opciones)                          // find({serie: serie}) //paginate ahora reemplaza al find      
    //con paginate el sort ahora va en las opciones
    //.sort({ fecha: -1, _id: -1 }) // ordenamos de mayor a menor (nuevos a antiguos)
    const resultados = consulta.docs  //con paginate los resultados ahora vienen dentro de docs
    if (resultados.length == 0) { console.log("No se encontró ningún dato con ese SERIE ", serie ) }
    const equipos = formateaFecha(resultados)
   // console.log(consulta)

    //NO se pueden llamar a partials desde aquí. siempre a los views. los renders siempre manejan páginas completas.
    //actualizamos la página y llenamos la tabla:
    res.render('index', {
      inventario,
      equipos,         //estas son variables de Handlebars para la TABLA
      serie,
      fechaActual: hoy(),
      mostrarHistorial: true,
      resultadosDe: 'Historial: ',
      busqueda: serie,
      equipo,
      pagination: {
        url: `/api/equipos/${serie}?limit=${limit}`,
        totalDocs: consulta.totalDocs,
        limit: consulta.limit,
        totalPages: consulta.totalPages,
        page: consulta.page,
        hasPrevPage: consulta.hasPrevPage,
        hasNextPage: consulta.hasNextPage,
        prevPage: consulta.prevPage,
        nextPage: consulta.nextPage
      }
    })
    //res.status(200) no hace falta cuando ya respondemos con algo como render, redirect, o send
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(500).json({ mensaje: 'Error al realizar la consulta: ', err })
  }
})

//Los VALUE de los INPUTS también pueden ser modificados con {{variable}}
//PERO NO PUEDEN SER LEÍDOS DESDE EL SERVIDOR, sólo desde el cliente con JS

//CREAR NUEVO (maneja el SUBMIT del FORMULARIO)
equiposRouter.post('/', async (req, res) => {       //DE ALGUNA FORMA TENGO QUE PASAR EQUIPO A "TODOS" luego de GUARDAR
  const { body } = req                                         //obtengo sólo el body
  console.log("Post hacia api/equipos: " + body.serie)
  try {
    const nuevo = await Equipomodel.create(body)      //creamos un nuevo registro. sólo si cumple los requerimientos del esquema.   
    //console.log(nuevo)
    const serie = body.serie
    //res.redirect('equipos/' + serie)     //redirigimos al serie recién agregado. no poner / al principio. 
    res.status(200)  //hay que responder con algo, con status NO es suficiente. salvo un redirect.
    res.json({ msg: 'se grabó :', serie })  // el Json va despues siempre
  }
  catch (err) {
    console.log("Error creando equipo. faltan datos: ", err.message)
    //res.json({Error: id, mensage: err.message}) CUIDADO PRIMERO EL STATUS. LUEGO EL JSON
    res.status(400).render('index', { serie, mensaje: 'Error al crear el equipo. Faltan datos.' })   // y si HAY UN ERROR hay que responder con algo. si no se queda PENSANDO.
    // NO ALCANZA con responder un status.
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
    let fechaActual = datos.fecha
    const linea = datos.linea
    const coche = datos.coche
    const problema = datos.problema
    const reparacion = datos.reparacion
    const caso = datos.caso

    // aquí renderizamos un VIEW con formulario de EDICION:
    res.render('formEdit', {
      inventario, equipo, serie, id, fechaActual,
      linea, coche, caso, problema, reparacion,
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
