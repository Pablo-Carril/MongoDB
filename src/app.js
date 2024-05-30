import express from 'express'
import session from 'express-session'
import indexRouter from './routers/index.router.js'
import userRouter from './routers/users.router.js'
import { initdb } from './db/mongodb.js'
import equiposRouter from './routers/equipos.router.js'
import notasRouter from './routers/notas.router.js'
//import handlebarsHelp from 'handlebars';  //es es el handlebars básico. si usamos expres-handlebars no hace falta este.
import handlebars from 'express-handlebars'  //es es el extendido para integración con express
import { __dirname, hoy } from './utils.js'
import path from 'path'
//import { log } from 'console'  
import morgan from 'morgan'    //morgan permite ver las solicitudes http por consola
import { sessionControl } from './middlewares/sessions.js'

const PORT = process.env.PORT
// session
const SESSION_SECRET = process.env.SESSION_SECRET
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

//app.use( (req, res, next)=> {     //nuestro propio middleware de alto nivel
//  console.log('se ha recibido una solicitud')
//  next()          //pasamos al siguiente middleware
//})

const SESSION_LIFETIME = 1000 * 60 * 90   //noventa minutos de sesión. luego expira

app.use(session({
  secret: SESSION_SECRET,      //hash para firmar los cookies que genera session
  resave: false,              //guarda la sesión en el almacenamiento en cada solicitud. genera mucho tráfico y llena la dB. es mejor rolling.
  saveUninitialized: true,     //crea la sesión igualmente aunque no haya datos guardados
  cookie: {
    maxAge: SESSION_LIFETIME       // Tiempo de vida de la cookie de sesión en milisegundos
  },
  rolling: true,       //renueva el tiempo de vida de la cookie en cada solicitud. sin esto se vence mientras la estás usando.
}
))   
//La única forma de mantener viva la sesión si la página sigue abierta es enviando un keep alive cada cierto tiempo:
app.post('/keep-alive', (req, res) => {    //ruta que recibe el keep-alive
  if (req.session) {
    // Opcional: puedes actualizar la fecha de expiración de la sesión aquí
    req.session._garbage = Date();
    req.session.touch();
    console.log("keepalive")
    res.sendStatus(200); // Enviar una respuesta de éxito
  } else {
    res.sendStatus(401); // La sesión no está activa
  }
});

app.use(express.json())   //permite usar JSON en el body de los req Http. si necesitamos texto podemos usar express.text. sólo para las solicitudes ENTRANTES al servidor. 
//app.use(bodyParser.json()); esta es otra forma pero hay que importarla
app.use(express.urlencoded({ extended: true }))   //para que hacepte datos de FORMULARIOS y url extendidas, o sea símbolos &, :, #, etc
// también los datos de los formularios los convierte a formato Json. si no no se podrían leer.
app.use(express.static(path.join(__dirname, './public')))  //definimos la carpeta estática. usamos path para definir mejor una carpeta absoluta
//Ahora /public es la carpeta raíz de todo el proyecto y no se podrá acceder a ninguna carpeta superior. los atajos para encontrar rutas en VSCode ya no sirven del lado del CLIENTE.
//por DEFECTO el server envía el INDEX.HTML ubicado dentro de public. no es necesario especificarlo. sacar index.html para que funcione handlebars.
//app.use('/public', sessionControl, express.static('public')); sólo si necesitamos proteger la carpeta publics


//app.use((req, res, next) => {     //middleware para que el navegador no guarde en caché la página de la app.
//  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
//  next()  
//})          

app.use((req, res, next) => {   //para enviar equipo ELEGIDO a TODOS los routers. tiene que estar antes de ellos.
  req.equipoElegido = elegido;  //Muy BUENA manera de enviar VARIABLES GLOBALES a TODAS las solicitudes HTTP.
 // console.log('middle elegido: ', elegido)   //de esta manera todos pueden leerlas y ser más dinámicos ANTES de renderizar.
  next();
});

app.use((error, req, res, next) => {     //nuestro propio middleware de error cuando todos los anteriores fallan.
  const mensaje = 'ha ocurrido un error desconocido: '
  console.log(mensaje, error)
  res.status(500).json({ mensaje })
})


//iniciamos MONGODB:
initdb()

//Página PRINCIPAL
app.get('/', async (req, res) => {   //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
  // console.log('equipo elegido: ', req.equipoElegido )  //no viene a travez de body.
  try {
    if (!req.session.counter) {     //Al iniciar una nueva sesión RESETEAMOS TODAS las variables.
      req.session.counter = 1
      req.session.logeado = true;       //registramos el nuevo logueo 
      console.log('Bienvenido. nueva sesión iniciada')
      elegido = 'todos'
    }
    else {
      req.session.counter++
      console.log(`has visitado ${req.session.counter} veces`)
    }
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
  }
  catch (err) {
    console.log("Error mostrando la pagina principal:  ", err)
    res.status(500).send("Error mostrando la página principal");
  }
})

app.post('/equipoElegido', (req, res) => {
  try {
    elegido = req.body.equipo     //variable Global, equipo ELEGIDO. la necesito para que cada filtro ultimos, sonda, la plata, etc me muestre sólo el elegido.
   // console.log("/equipoElegido(app):" + elegido)
    res.status(200).json({ msg: elegido })   //las respuestas van DESPUES del STATUS siempre!, si no no llegan o producen problemas!!
    //console.log(msg)
  }          // SE PODRÁ HACER UN res.redirect(req.get('referer')) para FILTRAR por EQUIPO AQUí ?????????
  catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
})

//Los routers tienen que estar DESPUES de los middlewares que LE AFECTAN. los otros middlewares DESPUÉS!
app.use('/', indexRouter, sessionControl)    //router del raíz. aquí especificamos el de handlebars, pero si existe index.html en public toma ese primero.
app.use('/api/users', userRouter, sessionControl)     //agregamos todos los routers dentro de /api mediante comas (userRouter, carritoRouter, etc)
app.use('/api/equipos', equiposRouter, sessionControl)
app.use('/', notasRouter, sessionControl)   //ejemplo de otras rutas sobre la raíz. el use no es para encerrar o limitar a una ruta en especial. sólo desde dónde se accede.

app.use((req, res) => {  //middleware para cualquier otra ruta que no tenga router
  res.send('No se encontró la página')
  res.status(404)
})   // si este middleware estuviera al principio en todas las rutas se ejecutaría este primero.

//iniciamos el SERVIDOR:
app.listen(PORT, () => {
  console.log(`Servidor corriendo en Puerto: ${PORT}`)
})






