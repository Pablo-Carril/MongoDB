import express from 'express'
import indexRouter from './routers/index.router.js'
import userRouter from './routers/users.router.js'
import { initdb } from './db/mongodb.js'
import equiposRouter from './routers/equipos.router.js'
//import handlebarsHelp from 'handlebars';  //es es el handlebars básico. si usamos expres-handlebars no hace falta este.
import handlebars from 'express-handlebars'  //es es el extendido para integración con express

import { __dirname } from './utils.js'
import path from 'path'
//import { log } from 'console'  
import morgan from 'morgan'    //morgan permite ver las solicitudes http por consola
const PORT = process.env.PORT

let elegido = 'ninguno'

const helpers = handlebars.create()
// Definir un helper llamado "isSelected"
helpers.handlebars.registerHelper('isSelected', function (value, expectedValue) {
  return value === expectedValue ? 'selected' : '';   //si coinciden retorna true
});

helpers.handlebars.registerHelper('colorOpcion', function (equipo) {  //Este helper funciona perfecto. ver Ultimos.
  const colores = {
    'validador': '#0d6efd',    //validadores                  
    'teclado': '#198754',      //teclados                     
    'mountinKit': '#AA2',    //MK
    'concentrador': '#fd7e14',   //Concentradores
    'otros': '#666',             //otros
  };
  //console.log(`Color para ${equipo}: ${colores[equipo]}`)
  return colores[equipo] || '#aaa'  //'#0d6efd'  
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

app.use((req, res, next) => {   //middleware para enviar la variable del equipo elegido a TODOS los routers. tiene que estar antes de ellos.
  req.equipoElegido = elegido;  //está funcionando BIEN. sólo que al inicio pone ninguno. poner todos?
  // console.log('midle', elegido)
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

//document.getElementById('loading-popup').style.display = 'block';


//iniciamos MONGODB:
//initdb()
app.get('/iniciar-db', (req, res) => {
  // Iniciar la carga de la base de datos aquí
console.log('iniciamos db:')

  initdb()
    .then(() => {
      // Base de datos iniciada con éxito
      console.log('Base de datos iniciada');
      res.sendStatus(200); // Enviar un código de estado 200 para indicar éxito
    })
    .catch(error => {
      // Manejar errores al iniciar la base de datos
      console.error('Error al iniciar la base de datos:', error);
      res.sendStatus(500); // Enviar un código de estado 500 para indicar un error interno del servidor
    });
});

//Mostramos página de LOADING:     // hay que acceder a ella desde el ACCESO DIRECTO de la PC ! que macana...
//app.get('/cargando', (req, res) => {
//  res.sendFile(path.join(__dirname, 'public/loading.html'));
  
  //iniciamos MONGODB:
//  initdb().then(() => {
    // Base de datos iniciada con éxito
//    console.log('Base de datos iniciada');
   
   // setTimeout(() => {
   //   console.log('Redirigiendo a la página principal');
   //   res.redirect('/');
   // }, 3000); // Redirigir después de 3 segundos (ajusta este tiempo según sea necesario)
    
//  }).catch(error => {
    // Manejar errores al iniciar la base de datos
 //   console.error('Error al iniciar la base de datos:', error);
//  });
  
//});

app.post('/equipoElegido', (req,res) => {
  try { 
    elegido = req.body.equipo     //variable Global, equipo ELEGIDO. la necesito para que cada filtro ultimos, sonda, la plata, etc me muestre sólo el elegido.
    console.log(elegido)
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





