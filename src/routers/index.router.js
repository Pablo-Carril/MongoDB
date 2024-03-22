
import {Router} from 'express'
import handlebars from 'handlebars'  
const indexRouter = Router()
import {DateTime} from 'luxon'

const ahora = DateTime.now()
let fecha = ahora.toISODate()     //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').

//por algún motivo desaparece el calendario YA no hace falta. ahora funciona todo.
//handlebars.registerHelper('formatFecha', function (fechaLuxon) {   //el helper funciona pero fechaluxon es undefined cuando uso fecha.
//  console.log(fechaLuxon)
  //return fechaLuxon.toFormat('yyyy-MM-dd');
//  return fechaLuxon
//});

indexRouter.get('/', (req, res)=>{   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  res.render('index',  {             //respondemos con un index.handlebars, no hace falta la extención porque ya la seteamos antes
    title: 'Control de Equipos',
    fechaActual: fecha,
    mostrarTabla: false, 
    mostrarUltimos: true,
  })
    res.status(200)           
   // res.json({ message: 'Bienvenido al Servidor'})
    console.log('usuario conectado')
  }) 

  indexRouter.get('/about', (req, res)=>{ 
    res.render('about')                      //estos deben estar en /views para que los tome. no en partials.
      res.status(200)           
    }) 



//module.exports = indexRouter
export default indexRouter