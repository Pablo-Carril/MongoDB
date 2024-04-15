import { Router } from 'express'
import { Equipomodel} from '../models/equipo.model.js'
import { DateTime } from 'luxon'
import formateaResultados from '../utils.js'
const indexRouter = Router()

const ahora = DateTime.now()
let fecha = ahora.toISODate()     //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').

//por algún motivo desaparece el calendario YA no hace falta. ahora funciona todo.
//handlebars.registerHelper('formatFecha', function (fechaLuxon) {   //el helper funciona pero fechaluxon es undefined cuando uso fecha.
//  console.log(fechaLuxon)
//return fechaLuxon.toFormat('yyyy-MM-dd');
//  return fechaLuxon
//});

//Al iniciar pide los ULTIMOS:
indexRouter.get('/', async (req, res) => {   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); //para que el navegador no guarde la página en cache. si no, sigue andando aunque el server no lo esté.
  console.log('equipo elegido: ', req.equipoElegido )  //no viene a travez de body.
  let elegido = req.equipoElegido
  try {
    const resultados = await Equipomodel.find().sort({ _id: -1 }).limit(20) //ULTIMOS VEINTE
    // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaResultados(resultados)
    res.render('index', {       // aquí es donde NACEN los nombres de VARIABLES usadas en Handlebars
      equipos,                  // cuidado: puede haber otro router llamando al mismo handlebars.
      fechaActual: fecha,      
      resultadosDe: 'Ultimos anotados:',
      busqueda: '',
      mostrarHistorial: false,
      mostrarUltimos: true,
      //entregado,
     })  //estas son variables de Handlebars para la TABLA
    console.log('usuario conectado')
    res.status(200)
  }
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

  indexRouter.get('/sonda', async (req, res) => {   
    console.log('Sonda')
    try {      
      const resultados = await Equipomodel.find({linea: { $in: ["85", "98"] }}).sort({ _id: -1 }).limit(20) 
      // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
      if (resultados.length == 0) { console.log("No se encontró ningún dato") }
      const equipos = formateaResultados(resultados)
      res.render('index', {       
        equipos,                  
        fechaActual: fecha,
        resultadosDe: 'Ultimos',
        busqueda: 'Sonda',
        mostrarHistorial: false,
        mostrarUltimos: true,
        })  
      res.status(200)
    }
    catch (err) {
      console.log("Error en la búsqueda por número de serie:  ", err)
      res.status(400)
    }
})

indexRouter.get('/laplata', async (req, res) => {   
  console.log('laplata')
  try {      
    const resultados = await Equipomodel.find({linea: { $in: ["307", "275"] }}).sort({ _id: -1 }).limit(20)
    // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaResultados(resultados)
    res.render('index', {       // aquí es donde NACEN los nombres de VARIABLES usadas en Handlebars
      equipos,                  // cuidado: puede haber otro router llamando a lo mismo.
      fechaActual: fecha,
      resultadosDe: 'Ultimos',
      busqueda: 'La Plata',
      mostrarHistorial: false,
      mostrarUltimos: true })  //estas son variables de Handlebars para la TABLA
    res.status(200)
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(400)
  }
})

indexRouter.post('/busqueda', async (req, res) => {
  const busqueda = req.body.datosBuscar || 'nada'   //por body vienen datos de formulario sólamente cuando hacemos un post desde el cliente.
  console.log('busqueda: ', busqueda)
  try {      
    const resultados = await Equipomodel.find({
      $or: [     //buscamos en varios campos. traemos todos los que cumplan (operación OR)
        {problema: { $regex: busqueda, $options: "i" }},
        {caso: { $regex: busqueda, $options: "i" }},
        {coche: { $regex: busqueda, $options: "i" }},
       ]
      }).sort({ _id: -1 }).limit(20) 
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const equipos = formateaResultados(resultados)
    res.render('index', {       
      equipos,                  
      fechaActual: fecha,
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

indexRouter.post('/entregado/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const estado = await Equipomodel.findById(id);
    const nuevoEstado = !estado.entregado;
    await Equipomodel.findByIdAndUpdate(id, { entregado: nuevoEstado });
    res.send('entregado: ', nuevoEstado);
  } catch (error) {
    res.status(500).send('Error al actualizar el estado.');
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