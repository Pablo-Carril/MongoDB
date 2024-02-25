import {Router} from 'express'
//import {v4 as uuidv4} from 'uuid'
import {Validadormodel} from '../models/validador.model.js'  
import {DateTime} from 'luxon'

const ahora = DateTime.now()
let fechaActual = ahora.toFormat('dd/MM/yyyy')

const validadorRouter = Router()
//realmente es necesario acceder a '/validadores' ? creo que no, por ahí en un futuro mostrar los ULTIMOS.

//CONSULTAR POR ID:
validadorRouter.get('/validadores/:serie', async (req,res)=> {     //api/validadores/numero
  const serie = req.params.serie      //obtenemos el serie pedido
  const validadores = [];
  const resultados = await Validadormodel.find({serie})    //consultamos el modelo y por tanto la base de datos.
  
  //antes de llenar la tabla hay que procesar las fechas y actualizar los datos
  //Procesamos los datos de la DB:
  resultados.forEach((datos) => {
    let fecha = datos.fecha
    let fechaLuxon = DateTime.fromISO(fecha)
    let nuevaFecha = fechaLuxon.toFormat('dd/MM/yyyy')
    validadores.push({       //llenamos un nuevo array con un objeto
      ...datos.toObject(),   //convertimos el documento a objeto normal con todos sus datos
      fecha: nuevaFecha      //pero la fecha ahora será la modificada
    });
   // console.log(validadores);
  })
  //NO se pueden llamar a partials desde aquí. siempre a los views. los renders siempre manejan páginas completas.
  //actualizamos la página y llenamos la tabla
  res.render('index', { validadores, serie, fechaActual })
  res.status(200)  
})

//CREAR NUEVO
validadorRouter.post('/validadores', async (req, res) => {              
  const { body } = req                                         //obtengo sólo el body
  console.log("Post hacia /validadores: ")
  try {
    const nuevo = await Validadormodel.create(body)      //creamos el nuevo equipo. sólo si cumple los requerimientos del esquema.   
    res.status(201).json(nuevo)     //funciona ok. si no respondemos con 201 el navegador se queda pensando...
  }
  catch (err) {
    console.log("Error creando equipo. faltan datos: ", err.message)
    res.status(400).json({message:'No se pudo crear. faltan datos o son incorrectos'})
  }
})  

//EDITAR: (put)
//Los VALUE de los INPUTS también pueden ser modificados con {{variable}}
//PERO NO PUEDEN SER LEÍDOS DESDE EL SERVIDOR, sólo desde el cliente con JS
//validadores/edit/:id (put)

  //Una vez llenada la tabla PODREMOS EDITAR una fila con un formulario handlebars independiente PERO
  //se los LLAMARÁ mediante URI: validadores/edit/:id (put), validadores/delete/:id, validadores/nuevo/, etc
  //no sepueden enviar métodos put o delete mediante el submit del form así que hay que idear otro método.
   // ** Y POR BOTONES SE PUEDE ????? ***


export default validadorRouter       //para importar en app.js