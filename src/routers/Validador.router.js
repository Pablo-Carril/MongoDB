import {Router} from 'express'
//import {v4 as uuidv4} from 'uuid'
import {Validadormodel} from '../models/validador.model.js'  
import {DateTime} from 'luxon'

const ahora = DateTime.now()
let fechaActual = ahora.toISODate()  //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').

const validadorRouter = Router()
//realmente es necesario acceder a '/validadores' ? creo que no, por ahí en un futuro mostrar los ULTIMOS.

//CONSULTAR POR ID:
validadorRouter.get('/validadores/:serie', async (req,res)=> {     //api/validadores/numero
  const serie = req.params.serie      //obtenemos el serie pedido
  try {
   const resultados = await Validadormodel.find({serie})    //consultamos el modelo y por tanto la base de datos.
    if (resultados.length == 0) { console.log("No se encontró ningún dato ☹")}    
    const validadores = formateaResultados(resultados)
    //NO se pueden llamar a partials desde aquí. siempre a los views. los renders siempre manejan páginas completas.
    //actualizamos la página y llenamos la tabla
    res.render('index', {validadores, serie, fechaActual})  //estas son variables de Handlebars para la TABLA
    res.status(200)  
  }
  catch (err) {
    console.log("Error en la búsqueda por número de serie:  ", err)
  }
})

function formateaResultados(resultados) {
  const validadores = [];
  //Procesamos los datos de la DB:
  if (Array.isArray(resultados)) {
    resultados.forEach((datos) => {
      let fecha = datos.fecha
      let fechaLuxon = DateTime.fromISO(fecha)
      let nuevaFecha = fechaLuxon.toFormat('dd/MM/yyyy')
      validadores.push({       //llenamos un nuevo array con un objeto
        ...datos.toObject(),   //convertimos el documento a objeto normal con todos sus datos
        fecha: nuevaFecha      //pero la fecha ahora será la modificada
      });
    })
    return validadores
  } else {
    let fecha = resultados.fecha
    let fechaLuxon = DateTime.fromISO(fecha)
    let nuevaFecha = fechaLuxon.toFormat('dd/MM/yyyy')
    validadores.push({
       fecha: nuevaFecha,
       linea: resultados.linea,
       coche: resultados.coche,
       problema: resultados.problema,
       caso: resultados.caso
    })
    return validadores
  }
}

//Los VALUE de los INPUTS también pueden ser modificados con {{variable}}
//PERO NO PUEDEN SER LEÍDOS DESDE EL SERVIDOR, sólo desde el cliente con JS

//CREAR NUEVO
validadorRouter.post('/validadores', async (req, res) => {              
  const { body } = req                                         //obtengo sólo el body
  console.log("Post hacia /validadores: " + body.serie)
  try {
    const nuevo = await Validadormodel.create(body)      //creamos un nuevo registro. sólo si cumple los requerimientos del esquema.   
    //console.log(nuevo)
    const serie = body.serie
    res.redirect('validadores/' + serie)     //redirigimos al serie recién agregado. no poner / al principio.
    res.status(201)  //funciona ok. si no respondemos con 201 el navegador se queda pensando...y hay que responder con algo
  }                 
  catch (err) {
    console.log("Error creando equipo. faltan datos: ", err.message)
    res.render('index', {serie})   // y si HAY UN ERROR hay que responder con algo. si no se queda PENSANDO.
    //res.json({Error: id, mensage: err.message})
    res.status(400)       // NO ALCANZA con responder un status.
  }
})  

//Formulario para Editar: 
//Una vez llenada la tabla PODREMOS EDITAR una fila con un formulario handlebars. mediante un botón llamaremos a un fetch mediante JS
validadorRouter.get('/validadores/edit/:id', async (req, res) => {
  const id = req.params.id
  console.log('Editar recibido: ' + id)  

  // traer los de la base de datos
  const datos = await Validadormodel.findById(id)
  //console.log(datos)
  //completar el formulario
  const serie = datos.serie
  fechaActual = datos.fecha
  const linea = datos.linea
  const coche = datos.coche
  const problema = datos.problema
  const caso = datos.caso
  //fechaActual = fechaEdit

  //equipo.findByIdAndUpdate( )   ESTO devería estar luego del submitt guardar, con PUT, en otra función

  // aquí renderizamos un nuevo VIEW con formulario de EDICION:
  res.render('formEdit', {  
    serie, id, fechaActual,
    linea, coche, caso, problema,
    })  
  //res.json({Editando: id, serie: serie})
  res.status(200)
})


validadorRouter.put('/validadores/actualiza/:id', async (req, res) => {
  const id = req.params.id
  const { body } = req
  console.log("actualizando: ", id)

  console.log(body)
  
  res.json({msg: 'se actualizó :', id: id})
  res.status(200)
})


validadorRouter.delete('/validadores/delete/:id', async (req, res) => {   //'/validadores/:id'
  const id = req.params.id
  const { body } = req
  const serie = body.serie   //para que quiero el serie aquí??? será en edit?
  console.log('Delete recibido: ' + id)
  
  //equipo.findByIdAndDelete(  )

  res.json({msg: 'se eliminó :', id: id})       //responder de esta forma permite ver los mensajes en la CONSOLA del CLIENTE (si lo capturamos con JS)
  //res.render('formEdit', {serie, id, fechaActual}) 
  res.status(200)
})

export default validadorRouter       //para importar en app.js