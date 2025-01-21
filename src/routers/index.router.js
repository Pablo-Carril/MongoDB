import { Router } from 'express'
import { Equipomodel } from '../models/equipo.model.js'
//import { DateTime } from 'luxon'
import { formateaFecha, hoy } from '../utils.js'
import { inventario } from '../utils.js'
import { sessionControl } from '../middlewares/sessions.js'

const indexRouter = Router()

//ULTIMOS:
indexRouter.get('/ultimos', sessionControl, async (req, res) => {   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); //para que el navegador no guarde la página en cache. si no, sigue andando aunque el server no lo esté.
  console.log('equipo elegido: ', req.equipoElegido)  //no viene a travez de body, es una variable GLOBAL que se inserta en el req
  const { limit = 13, page = 1 } = req.query  // esto permite usar: /ultimos?limit=3&page=2 y puse valores por defecto. TRABAJA CON LOS BOTONES de PAGINACIÓN. no borrar!
  let elegido = req.equipoElegido || ''   //si es undefined o null le asigna una cadena vacía.
  let equipo = elegido  //envío equipo en vez de elegido para que lo acepte el formulario (se usa también para editar)
  if (equipo == 'todos' || equipo == null) { elegido = '' }   //a veces viene como todos y a veces vacío, por el select. ok.
  try {
    const filtro = elegido === '' ? {} : { equipo: elegido } //filtramos por equipo ELEGIDO:  //si elegido esta vacío busca todos. si no, el equipo elegido.
    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { fecha: -1, _id: -1 },   //Primero se ordena por fecha, y si hay varios con la misma fecha los ordena por id. GENIAL.    
    }

    const consulta = await Equipomodel.paginate(filtro, opciones)
    const resultados = consulta.docs
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {       // aquí es donde NACEN los nombres de VARIABLES usadas en Handlebars. así que no hace falta poner un let, pero SI hace falta el let en otras ocaciones.
      inventario,
      equipos,                  // cuidado: puede haber otro router llamando al mismo handlebars.
      fechaActual: hoy(),
      resultadosDe: 'Ultimos',
      busqueda: elegido,  //aquí debería estar el equipo elegido
      mostrarHistorial: false,
      mostrarUltimos: true,
      equipo,          // envío equipo en vez de elegido para que no haya conflico al EDITAR que usa {{equipo}} en el select
      spinner: true,
      pagination: {
        url: `/ultimos?limit=${limit}`,
        totalDocs: consulta.totalDocs,
        limit: consulta.limit,
        totalPages: consulta.totalPages,
        page: consulta.page,
        hasPrevPage: consulta.hasPrevPage,
        hasNextPage: consulta.hasNextPage,
        prevPage: consulta.prevPage,
        nextPage: consulta.nextPage
      }
    })  //estas son variables de Handlebars para la TABLA
    //console.log('usuario conectado')
    res.status(200)      // con .res(message: 'ok', redirect: '/' ) PODEMOS REDIRIGIR SEGÚN LA DESICIÓN DEL SERVIDOR, y en el cliente,
  }                      // mediante resjson = await res.json(); if(resjson.redirect) { window.location.href = resjson.redirect } en el Fetch
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(400)
  }
  //res.render('index', {             //respondemos con un index.handlebars, no hace falta la extención porque ya la seteamos antes
  //title: 'Control de Equipos',
  //     style: 'estilos.css',             // podemos aplicar ESTILOS individuales a cada PLANTILLA  
  //fechaActual: fecha,
})

// SONDA
indexRouter.get('/sonda', sessionControl, async (req, res) => {
  let elegido = req.equipoElegido
  let equipo = elegido  //envío equipo en vez de elegido  
  if (equipo == 'todos') { elegido = '' }
  //console.log('Sonda')
  const { limit = 13, page = 1 } = req.query
  try {
    const filtro = elegido === '' ? { linea: { $in: ["85", "98"] } }
    : { $and: [{ equipo: elegido }, { linea: { $in: ["85", "98"] } }] }       //si elegido esta vacío busca todos. si no, el equipo elegido.
    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { fecha: -1, _id: -1 },   //Primero se ordena por fecha, y si hay varios con la misma fecha los ordena por id. GENIAL.    
    }
    const consulta = await Equipomodel.paginate(filtro, opciones)
    const resultados = consulta.docs
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {
      inventario,
      equipos,
      fechaActual: hoy(),
      resultadosDe: 'Sonda',
      busqueda: elegido,
      mostrarHistorial: false,
      mostrarUltimos: true,
      equipo,
      pagination: {
        url: `/sonda?limit=${limit}`,
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
    res.status(200)
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(400)
  }
})

//LA PLATA
indexRouter.get('/laplata', sessionControl, async (req, res) => {
  let elegido = req.equipoElegido
  let equipo = elegido  //envío equipo en vez de elegido
  if (equipo == 'todos') { elegido = '' }
  //console.log('laplata')
  const { limit = 13, page = 1 } = req.query
  try {
    const filtro = elegido === '' ? { linea: { $in: ["275", "307"] } }
    : { $and: [{ equipo: elegido }, { linea: { $in: ["275", "307"] } }] }     
    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { fecha: -1, _id: -1 },      
    }
    const consulta = await Equipomodel.paginate(filtro, opciones)
    const resultados = consulta.docs
    // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {       // aquí es donde NACEN los nombres de VARIABLES usadas en Handlebars
      inventario,
      equipos,                  // cuidado: puede haber otro router llamando a lo mismo.
      fechaActual: hoy(),
      resultadosDe: 'La Plata',
      busqueda: elegido,
      mostrarHistorial: false,
      mostrarUltimos: true,
      equipo,
      pagination: {
        url: `/laplata?limit=${limit}`,
        totalDocs: consulta.totalDocs,
        limit: consulta.limit,
        totalPages: consulta.totalPages,
        page: consulta.page,
        hasPrevPage: consulta.hasPrevPage,
        hasNextPage: consulta.hasNextPage,
        prevPage: consulta.prevPage,
        nextPage: consulta.nextPage
      }
    })  //estas son variables de Handlebars para la TABLA
    res.status(200)
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(400)
  }
})

//BUSCAR
indexRouter.get('/busqueda', sessionControl, async (req, res) => {
  const busqueda = req.query.datosBuscar || 'nada'   //por body vienen datos de formulario sólamente cuando hacemos un post desde el cliente.
  const { limit = 13, page = 1 } = req.query
  //console.log('busqueda: ', busqueda)
  try {
    const filtro = {
      $or: [     //buscamos en varios campos. traemos todos los que cumplan (operación OR)
        { problema: { $regex: busqueda, $options: "i" } },
        { caso: { $regex: busqueda, $options: "i" } },
        { coche: { $regex: busqueda, $options: "i" } },
        { equipo: { $regex: busqueda, $options: "i" } },
      ]
    }    
    const opciones = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { fecha: -1, _id: -1 },      
    }
    const consulta = await Equipomodel.paginate(filtro, opciones)
    const resultados = consulta.docs

   /*  const resultados = await Equipomodel.find({
      $or: [     //buscamos en varios campos. traemos todos los que cumplan (operación OR)
        { problema: { $regex: busqueda, $options: "i" } },
        { caso: { $regex: busqueda, $options: "i" } },
        { coche: { $regex: busqueda, $options: "i" } },
        { equipo: { $regex: busqueda, $options: "i" } },
      ]
    }).sort({ fecha: -1, _id: -1 }).limit(40) */

    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {
      inventario,
      equipos,
      fechaActual: hoy(),
      resultadosDe: 'Buscar:',
      busqueda: busqueda,
      mostrarHistorial: false,
      mostrarUltimos: true,
      pagination: {
        url:`/busqueda?datosBuscar=${busqueda}&limit=${limit}`,  //"/busqueda?datosBuscar=" + busqueda
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
    res.status(200)
  }
  catch (err) {
    console.log("Error en buscar: ", err)
    res.status(400)
  }
})

//CHECK ENTREGADO
indexRouter.post('/entregado/:id', sessionControl, async (req, res) => {
  const id = req.params.id;
  try {
    const equipo = await Equipomodel.findById(id);
    if (!equipo) {
      return res.status(404).send({ error: 'Equipo no encontrado' });
    }
    const nuevoEstado = !equipo.entregado;
    await Equipomodel.findByIdAndUpdate(id, { entregado: nuevoEstado });
    // res.send({ message: 'Estado de entrega actualizado'})
    //res.redirect(req.get('referer')) //esto es GENIAL: puedo redirigir a la página que hiso el POST y no a la que llamó el formulario (form action="entregado/{{_id}}")
    res.send({ entregado: nuevoEstado })  //respondemos con el nuevoestado de entregado
  } catch (error) {
    res.status(500).send('Error al actualizar el estado:' + error);
  }
});

indexRouter.get('/ayuda', sessionControl, (req, res) => {
  res.render('ayuda')
  res.status(200)
})

indexRouter.get('/about', (req, res) => {
  res.render('about')
  res.status(200)
})


//module.exports = indexRouter
export default indexRouter