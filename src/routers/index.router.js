import { Router } from 'express'
import { Equipomodel} from '../models/equipo.model.js'
import { DateTime } from 'luxon'
import formateaFecha from '../utils.js'
const indexRouter = Router()

const hoy = () => {
  const ahora = DateTime.now()
  return ahora.toISODate()  //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').
}

//por algún motivo desaparece el calendario YA no hace falta. ahora funciona todo.
//handlebars.registerHelper('formatFecha', function (fechaLuxon) {   //el helper funciona pero fechaluxon es undefined cuando uso fecha.
//  console.log(fechaLuxon)
//return fechaLuxon.toFormat('yyyy-MM-dd');
//  return fechaLuxon
//});

//Al iniciar mostrar ULTIMOS:
indexRouter.get('/ultimos', async (req, res) => {   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); //para que el navegador no guarde la página en cache. si no, sigue andando aunque el server no lo esté.
  console.log('equipo elegido: ', req.equipoElegido )  //no viene a travez de body.
  let elegido = req.equipoElegido
  let equipo = elegido  //envío equipo en vez de elegido para que lo acepte el formulario (se usa también para editar)
  if (equipo == 'todos') { elegido = '' }   //a veces viene como todos y a veces vacío, por el select. ok.
  try {
    //filtramos por equipo ELEGIDO:       //si elegido esta vacío busca todos. si no, el equipo elegido.
    const resultados = await Equipomodel.find(elegido === '' ? {} : { equipo: elegido })
       .sort({ fecha: -1, _id: -1 }).limit(40) //Primero se ordena por fecha, y si hay varios con la misma fecha los ordena por id. GENIAL.
    // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {       // aquí es donde NACEN los nombres de VARIABLES usadas en Handlebars. así que no hace falta poner un let, pero SI hace falta el let en otras ocaciones.
      equipos,                  // cuidado: puede haber otro router llamando al mismo handlebars.
      fechaActual: hoy(),      
      resultadosDe: 'Ultimos anotados:',
      busqueda: elegido,  //aquí debería estar el equipo elegido
      mostrarHistorial: false,
      mostrarUltimos: true,
      equipo,          // envío equipo en vez de elegido para que no haya conflico al EDITAR que usa {{equipo}} en el select
      spinner: true,
     // mostrarLoading: false, 
      //entregado,
     })  //estas son variables de Handlebars para la TABLA
    console.log('usuario conectado')
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
  //mostrarTabla: false,
  //mostrarUltimos: true,
  //})
  //  res.status(200)
   // res.json({ message: 'Bienvenido al Servidor'})
  //  console.log('usuario conectado')
  })

  // SONDA
  indexRouter.get('/sonda', async (req, res) => { 
    let elegido = req.equipoElegido
    let equipo = elegido  //envío equipo en vez de elegido  
    if (equipo == 'todos') { elegido = '' }
    console.log('Sonda')

    try {      
      const resultados = await Equipomodel.find(
        elegido === '' ? { linea: { $in: ["85", "98"]} } 
        : { $and: [ {equipo: elegido}, {linea: { $in: ["85", "98"]}} ] })
       .sort({fecha: -1, _id: -1 })
       .limit(40) 
      // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
      if (resultados.length == 0) { console.log("No se encontró ningún dato") }
      const equipos = formateaFecha(resultados)
      res.render('index', {       
        equipos,                  
        fechaActual: hoy(),
        resultadosDe: 'Ultimos',
        busqueda: 'Sonda',
        mostrarHistorial: false,
        mostrarUltimos: true,
        equipo,
        })  
      res.status(200)
    }
    catch (err) {
      console.log("Error en la búsqueda por número de serie:  ", err)
      res.status(400)
    }
})

//LA PLATA
indexRouter.get('/laplata', async (req, res) => {   
  let elegido = req.equipoElegido
  let equipo = elegido  //envío equipo en vez de elegido
  if (equipo == 'todos') { elegido = '' }
  console.log('laplata')
  try {      
    const resultados = await Equipomodel.find(elegido === '' ? { linea: { $in: ["275", "307"]} } 
    : { $and: [ {equipo: elegido}, {linea: { $in: ["275", "307"]}} ] })
   .sort({ fecha: -1, _id: -1 })
   .limit(40) 
    // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {       // aquí es donde NACEN los nombres de VARIABLES usadas en Handlebars
      equipos,                  // cuidado: puede haber otro router llamando a lo mismo.
      fechaActual: hoy(),
      resultadosDe: 'Ultimos',
      busqueda: 'La Plata',
      mostrarHistorial: false,
      mostrarUltimos: true,
      equipo,
     })  //estas son variables de Handlebars para la TABLA
    res.status(200)
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(400)
  }
})

//BUSCAR
indexRouter.post('/busqueda', async (req, res) => {
  const busqueda = req.body.datosBuscar || 'nada'   //por body vienen datos de formulario sólamente cuando hacemos un post desde el cliente.
  console.log('busqueda: ', busqueda)
  try {      
    const resultados = await Equipomodel.find({
      $or: [     //buscamos en varios campos. traemos todos los que cumplan (operación OR)
        {problema: { $regex: busqueda, $options: "i" }},
        {caso: { $regex: busqueda, $options: "i" }},
        {coche: { $regex: busqueda, $options: "i" }},
        {equipo: { $regex: busqueda, $options: "i" }},
       ]
      }).sort({ fecha: -1, _id: -1 }).limit(40) 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaFecha(resultados)
    res.render('index', {       
      equipos,                  
      fechaActual: hoy(),
      resultadosDe: 'Buscar:',
      busqueda: busqueda,
      mostrarHistorial: false,
      mostrarUltimos: true })  
    res.status(200)
  }
  catch (err) {
    console.log("Error en buscar: ", err)
    res.status(400)
  }
})

//CHECK ENTREGADO
indexRouter.post('/entregado/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const estado = await Equipomodel.findById(id);
    const nuevoEstado = !estado.entregado;
    await Equipomodel.findByIdAndUpdate(id, { entregado: nuevoEstado });
    res.status(200)
    res.redirect(req.get('referer')) //esto es GENIAL: puedo redirigir a la página que hiso el POST y no a la que llamó el formulario (form action="entregado/{{_id}}")
  } catch (error) {
    res.status(500).send('Error al actualizar el estado:' + error);
  }
});

indexRouter.get('/notas', (req, res) => {
  res.render('notas')                      
  res.status(200)
})

indexRouter.get('/about', (req, res) => {
  res.render('about')                      
  res.status(200)
})


//module.exports = indexRouter
export default indexRouter