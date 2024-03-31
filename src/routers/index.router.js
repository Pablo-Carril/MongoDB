import { Router } from 'express'
import handlebars from 'handlebars'
import { Validadormodel } from '../models/validador.model.js'
const indexRouter = Router()
import { DateTime } from 'luxon'

const ahora = DateTime.now()
let fecha = ahora.toISODate()     //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').

//por algún motivo desaparece el calendario YA no hace falta. ahora funciona todo.
//handlebars.registerHelper('formatFecha', function (fechaLuxon) {   //el helper funciona pero fechaluxon es undefined cuando uso fecha.
//  console.log(fechaLuxon)
//return fechaLuxon.toFormat('yyyy-MM-dd');
//  return fechaLuxon
//});

indexRouter.get('/', async (req, res) => {   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  try {
    const resultados = await Validadormodel.find({}).limit(50)  //ULTIMOS DIEZ con LIMIT  
    if (resultados.length == 0) { console.log("No se encontró ningún dato") }
    const validadores = resultados    //formateaResultados(resultados)
    res.render('index', { validadores, mostrarTabla: false, mostrarUltimos: true })  //estas son variables de Handlebars para la TABLA
    res.status(200)
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
    res.status(400)
  }
  //res.render('index', {             //respondemos con un index.handlebars, no hace falta la extención porque ya la seteamos antes
  //title: 'Control de Equipos',
  //fechaActual: fecha,
  //mostrarTabla: false,
  //mostrarUltimos: true,
  //})
  //  res.status(200)
   // res.json({ message: 'Bienvenido al Servidor'})
  //  console.log('usuario conectado')
  })

indexRouter.get('/about', (req, res) => {
  res.render('about')                      //estos deben estar en /views para que los tome. no en partials.
  res.status(200)
})




//module.exports = indexRouter
export default indexRouter