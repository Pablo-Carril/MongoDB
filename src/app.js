import express from 'express'
import indexRouter from './routers/index.router.js'
import userRouter from './routers/users.router.js'
import { initdb } from './db/mongodb.js'
import equiposRouter from './routers/equipos.router.js'
//import handlebarsHelp from 'handlebars';  //es es el handlebars básico. si usamos expres-handlebars no hace falta este.
import handlebars from 'express-handlebars'  //es es el extendido para integración con express
import { __dirname, hoy } from './utils.js'
import path from 'path'
//import { log } from 'console'  
import morgan from 'morgan'    //morgan permite ver las solicitudes http por consola

const PORT = process.env.PORT
// ************** PROBANDO NUEVA RAMA SESIONES ***************** EN PC DE CASA TAMBIÉN  **
let elegido = 'todos'

const helpers = handlebars.create()
// Definir un helper llamado "isSelected"
helpers.handlebars.registerHelper('isSelected', function (value, expectedValue) {
  return value === expectedValue ? 'selected' : '';   //si coinciden retorna true
});

helpers.handlebars.registerHelper('colorOpcion', function (equipo) {  //Este helper funciona perfecto. ver Ultimos.
  const colores = {
    '': '#333',               //Todos
    'validador': '#0d6efd',    //validadores                  
    'teclado': '#198754',      //teclados                     
    'mountinKit': '#BB2',    //MK
    'concentrador': '#fd7e14',   //Concentradores
    'otros': '#555',             //otros
    '85': '#1c68a7',
    '98': '#1c68a7',        // '#1f55b4',
    '307': '#0c6b72',      //'#09485f',
    '275': '#0c6b72',
  };
  //console.log(`Color para ${equipo}: ${colores[equipo]}`)
  return colores[equipo] || '#333'  //'#0d6efd'  
});


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
//app.use(bodyParser.json()); esta es otra forma pero hay que importarla
app.use(express.urlencoded({ extended: true }))   //para que hacepte datos de FORMULARIOS y url extendidas, o sea símbolos &, :, #, etc
// también los datos de los formularios los convierte a formato Json. si no no se podrían leer.
app.use(express.static(path.join(__dirname, './public')))  //definimos la carpeta estática. usamos path para definir mejor una carpeta absoluta
//Ahora /public es la carpeta raíz de todo el proyecto y no se podrá acceder a ninguna carpeta superior. los atajos para encontrar rutas en VSCode ya no sirven del lado del CLIENTE.
//por DEFECTO el server envía el INDEX.HTML ubicado dentro de public. no es necesario especificarlo. sacar index.html para que funcione handlebars.


//app.use((req, res, next) => {     //middleware para que el navegador no guarde en caché la página de la app.
//  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
//  next()  
//})          

app.use((req, res, next) => {   //para enviar equipo ELEGIDO a TODOS los routers. tiene que estar antes de ellos.
  req.equipoElegido = elegido;  //Muy BUENA manera de enviar VARIABLES GLOBALES a TODAS las solicitudes HTTP.
   console.log('midle: ', elegido)   //de esta manera todos pueden leerlas y ser más dinámicos ANTES de renderizar.
  next();
});

app.use((error, req, res, next) => {     //nuestro propio middleware de error cuando todos los anteriores fallan.
  const mensaje = 'ha ocurrido un error desconocido: '
  console.log(mensaje, error)
  res.status(500).json({ mensaje })
})

 //iniciamos el SERVIDOR:
 app.listen(PORT, () => {
  console.log(`Servidor corriendo en Puerto: ${PORT}`)
})

//iniciamos MONGODB:
initdb()

//Página PRINCIPAL
app.get('/', async (req, res) => {   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); //para que el navegador no guarde la página en cache. si no, sigue andando aunque el server no lo esté.
 // console.log('equipo elegido: ', req.equipoElegido )  //no viene a travez de body.
 // let elegido = req.equipoElegido
  try {
  //  const resultados = await Equipomodel.find().sort({ _id: -1 }).limit(20) //ULTIMOS VEINTE
    // tembién se podría con find().sort({ timestamp: -1 }).limit(10)  pero puede traer problemas en el orden de los resultados. 
  //  if (resultados.length == 0) { console.log("No se encontró ningún dato") }
  //  const equipos = formateaResultados(resultados)
    res.render('index', {       
     // equipos,               // Podría poner las NOTAS al iniciar...  
      fechaActual: hoy(),
      ocultar: true,      //esto lo pongo para que no actualize la página, que es lo que hace el fetch de /equipoElegido en el Formulario
     // resultadosDe: 'Ultimos anotados:',     //DEBEÍA MANEJAR esto de otra forma en vez de usar la variable ocultar.
     // busqueda: '',
     // mostrarHistorial: false,
     // mostrarUltimos: true,
     // mostrarLoading: true, //anulamos el loading. no hace falta en el deploy porque el servidor siempre está corriendo.
      //entregado,
     })  //estas son variables de Handlebars para la TABLA
    console.log('usuario conectado')
    res.status(200)
  }
  catch (err) {
    console.log("Error en la pagina principal:  ", err)
    res.status(400)
  }
})

app.post('/equipoElegido', (req,res) => {
  try { 
    elegido = req.body.equipo     //variable Global, equipo ELEGIDO. la necesito para que cada filtro ultimos, sonda, la plata, etc me muestre sólo el elegido.
    console.log("/equipoElegido(app):" + elegido)
    res.status(200).json({msg: elegido})   //las respuestas van DESPUES del STATUS siempre!, si no no llegan o producen problemas!!
    //console.log(msg)
  }          // SE PODRÁ HACER UN res.redirect(req.get('referer')) para FILTRAR por EQUIPO AQUí ?????????
  catch (error) {
   // console.error(error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
})

//Los routers tienen que estar DESPUES de los middlewares que LE AFECTAN. los otros middlewares DESPUÉS!
app.use('/', indexRouter)    //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
app.use('/api/users', userRouter)     //agregamos todos los routers dentro de /api mediante comas (userRouter, carritoRouter, etc)
app.use('/api/equipos', equiposRouter)

app.use((req, res) => {  //middleware para cualquier otra ruta que no tenga router
  res.send('No se encontró la página')
  res.status(404)
})   // si este middleware estuviera al principio en todas las rutas se ejecutaría este primero.





