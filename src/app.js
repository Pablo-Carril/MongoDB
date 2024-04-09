import express from 'express'
import indexRouter from './routers/index.router.js'
import userRouter from './routers/users.router.js'
import equiposRouter from './routers/equipos.router.js'
//import handlebarsHelp from 'handlebars';  //es es el handlebars básico. si usamos expres-handlebars no hace falta este.
import handlebars from 'express-handlebars'  //es es el extendido para integración con express

import {__dirname} from './utils.js'
import path from 'path'
//import { log } from 'console'  
import morgan from 'morgan'    //morgan permite ver las solicitudes http por consola

const helpers = handlebars.create()
// Definir un helper llamado "isSelected"
helpers.handlebars.registerHelper('isSelected', function(value, expectedValue) {
  return value === expectedValue ? 'selected' : '';
});

helpers.handlebars.registerHelper('colorOpcion', function(equipo) {  //Este helper funciona perfecto. ver Ultimos.
  const colores = {
    'Validador': '#0d6efd',    //validadores                  
    'Teclado': '#198754',      //teclados                     
    'MountinKit': '#AA2',    //MK
    'Concentrador': '#fd7e14',   //Concentradores
    'Otros': '#666',             //otros
  };
  //console.log(`Color para ${equipo}: ${colores[equipo]}`)
  return colores[equipo] || '#aaa'  //'#0d6efd'// si paso un valor a mano TODO FUNCIONA en la página.   
  
});

//const PUERTO = 3040   ***** AHORA LO VAMOS A MANEJAR DESDE .ENV *********

const app = express()    //necesitamos ejecutarlo para que nos devuelva el objeto con todas sus propiedades y métodos

//app.use(morgan('dev'))     //morgan mostrará los logs en formato dev. Habilitarlo cuando lo necesitemos.
  // es de buena ayuda con problemas de rutas hacia archivos.
app.set('views', path.join(__dirname, 'views'))  //donde estarán los templates
app.engine('handlebars', handlebars.engine({    //seleccionamos el engine de renderizado de templates (plantillas)
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,  //esto es importante para que acceda a las variables correctamente
    allowProtoMethodsByDefault: true,     //así como a los esquemas de la base de datos
  },
  //extname: 'hbs',
  //defaultLayout: 'main',
  layoutDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  //helpers: {},
}))      
app.set('view engine', 'handlebars')              //establecemos la extensión. puede ser .handlebars o .hbs


//app.set('partialsDir', path.join(__dirname, 'views/partials'))

//app.use( (req, res, next)=> {     //nuestro propio middleware de alto nivel
//  console.log('se ha recibido una solicitud')
//  next()          //pasamos al siguiente middleware
//})

app.use(express.json())   //permite usar JSON en el body de los req Http. si necesitamos texto podemos usar express.text
app.use(express.urlencoded({extended: true}))   //para que hacepte datos de FORMULARIOS y url extendidas, o sea símbolos &, :, #, etc
// también los datos de los formularios los convierte a formato Json. si no no se podrían leer.
app.use(express.static(path.join(__dirname, './public')))  //definimos la carpeta estática. usamos path para definir mejor una carpeta absoluta
//Ahora /public es la carpeta raíz de todo el proyecto y no se podrá acceder a ninguna carpeta superior. los atajos para encontrar rutas en VSCode ya no sirven del lado del CLIENTE.
//por DEFECTO el server envía el INDEX.HTML ubicado dentro de public. no es necesario especificarlo. sacar index.html para que funcione handlebars.

app.use('/', indexRouter)    //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
app.use('/api/users', userRouter)     //agregamos todos los routers dentro de /api mediante comas (userRouter, carritoRouter, etc)
app.use('/api/equipos', equiposRouter)

app.use( (req,res) => {        //middleware para cualquier otra ruta que no tenga router
  res.send('No se encontró la página')
  res.status(404)
})

app.use( (error, req, res, next) => {     //nuestro propio middleware de error cuando todos los anteriores fallan.
  const mensaje = 'ha ocurrido un error desconocido: '
  console.log(mensaje, error)
  res.status(500).json({mensaje})
})

//app.listen(PUERTO, ()=> {     //levantamos el servidor AHORA LO HACEMOS DESDE SERVER.JS
//    console.log(`Servidor corriendo en ${PUERTO}`)
//})

export default app     //exportamos nuestro servidor express para poder ser usado en server.js

