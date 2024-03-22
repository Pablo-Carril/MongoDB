import { Router } from 'express'
//import {v4 as uuidv4} from 'uuid'
import { Validadormodel } from '../models/validador.model.js'
import { DateTime } from 'luxon'

const ahora = DateTime.now()
let fechaActual = ahora.toISODate()  //para formulario es .toISODate(). para tabla es: toFormat('dd/MM/yyyy').

const validadorRouter = Router()
//realmente es necesario acceder a '/validadores' ? creo que no, por ahí en un futuro mostrar los ULTIMOS.

//CONSULTAR POR ID:
validadorRouter.get('/:serie', async (req, res) => {     //api/validadores/numero
  const serie = req.params.serie      //obtenemos el serie pedido
  try {
    const resultados = await Validadormodel.find({ serie })    //consultamos el modelo y por tanto la base de datos.
    if (resultados.length == 0) { console.log("No se encontró ningún dato ☹") }
    const validadores = formateaResultados(resultados)
    //NO se pueden llamar a partials desde aquí. siempre a los views. los renders siempre manejan páginas completas.
    //actualizamos la página y llenamos la tabla
    res.render('index', { validadores, serie, fechaActual, mostrarTabla: true, })  //estas son variables de Handlebars para la TABLA
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
validadorRouter.post('/', async (req, res) => {
  const { body } = req                                         //obtengo sólo el body
  console.log("Post hacia api/validadores: " + body.serie)
  try {
    const nuevo = await Validadormodel.create(body)      //creamos un nuevo registro. sólo si cumple los requerimientos del esquema.   
    //console.log(nuevo)
    const serie = body.serie
    res.redirect('validadores/' + serie)     //redirigimos al serie recién agregado. no poner / al principio.
    res.status(201)  //funciona ok. si no respondemos con 201 el navegador se queda pensando...y hay que responder con algo
  }
  catch (err) {
    console.log("Error creando equipo. faltan datos: ", err.message)
    res.render('index', { serie })   // y si HAY UN ERROR hay que responder con algo. si no se queda PENSANDO.
    //res.json({Error: id, mensage: err.message})
    res.status(400)       // NO ALCANZA con responder un status.
  }
})

//Formulario para Editar: 
validadorRouter.get('/edit/:id', async (req, res) => {
  const id = req.params.id
  //console.log('Editar recibido: ' + id)
  try {

    // traer los datos de la base de datos
    const datos = await Validadormodel.findById(id)
    //console.log(datos)
    //completar el formulario
    const serie = datos.serie
    fechaActual = datos.fecha
    const linea = datos.linea
    const coche = datos.coche
    const problema = datos.problema
    const caso = datos.caso
    
    // aquí renderizamos un VIEW con formulario de EDICION:
    res.render('formEdit', {
      serie, id, fechaActual,
      linea, coche, caso, problema,
    })
    //res.json({Editando: id, serie: serie})
    res.status(200)
  }
 catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
})


validadorRouter.put('/actualizar/:id', async (req, res) => {
  const id = req.params.id
  const serie = req.body.serie
  console.log("Actualizando: ", id)
  try {
    const datosFormulario = req.body
    console.log(datosFormulario)
    
    const resultado = await Validadormodel.findByIdAndUpdate(id, datosFormulario, {new:true})
    if (!resultado) {
      console.log('No se encontró el ID')
      return res.status(404).json({ msg: 'No se encontró el equipo para actualizar.' });
    } 
    res.json({ msg: 'se actualizó :', id: id })
    //res.redirect('validadores/' + serie) 
    res.status(200)
  }
  catch (error) {
    console.log('Error al actualizar el equipo: ', error);
    res.status(500).json({ error: 'Hubo un error al actualizar el equipo.' })
  }
})
//.then(response => {   //ESTA SERÍA LA FORMA de REDIRIGIR desde el SERVIDOR sin que lo haga el FETCH del cliente.
//  if (response.ok) {  
//    // Si la actualización se realiza correctamente, verificar si hay redirección
//    if (response.redirected) {
//      // Realizar la acción adecuada, como cargar la nueva página
//      window.location.href = response.url;


validadorRouter.delete('/delete/:id', async (req, res) => {   //'/validadores/:id'
  //res.render('popup')
  try {
    const id = req.params.id
    const { body } = req
    console.log('Borrando: ' + id)
    console.log(body)
    const result = await Validadormodel.findByIdAndDelete(id)
    if (!result) {
      // El documento no fue encontrado para eliminar
      return res.status(404).json({ error: 'El validador no fue encontrado.' });
    }
    //no se puede responder dos veces
    res.json({msg: 'se eliminó :', id: id})        //responder de esta forma permite ver los mensajes en la CONSOLA del CLIENTE (si lo capturamos con JS)
    //res.redirect('/api/validadores/' + body.serie)  //la ruta es correcta pero no sé porque FALLA
    //VOY a manejar la redirección a la página desde el CLIENTE
    res.status(200)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
  }
})

export default validadorRouter       //para importar en app.js