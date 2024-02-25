import {Router} from 'express'
import {Usermodel} from '../models/user.model.js'     //Los usuarios los traeremos del modelo de la base de datos

const userRouter = Router()


userRouter.get('/users', async (req,res)=> {          //queda api/users
 //  res.render('index',  {             //esto es de handlebars. NO lo vamos a usar. vamos a leer desde MongoDB
 //     title: 'titulo de la pagina',
 //     fullname: users.name,
 //     // aquí todos los datos de las variables y condicionales
 //     isAdmin: users.role === 'admin',
 //   })
  const users = await Usermodel.find({})     //nos trae TODOS
  res.status(200)
  res.json(users)     
})

userRouter.get('/users/:uid', async (req,res)=> {       // para pedir un usuario por id   
   const{uid} = req.params
  //const user = await Usermodel.findOne({_id: uid})     //mongoose permite usar un string aquí sin el ObjetID
   const user = await Usermodel.findById(uid)               //Pero esta función es mejor.
   if (!user) {
    return res.status(404).json({message:'Ususario no encontrado'})
   }
   res.status(200)
   res.json(user)     
 })

// Al crear un usuario:
userRouter.post('/users', async (req, res) => {              //cuando llegue un Post sobre users..
  const {body} = req
  try {
    const newUser = await Usermodel.create(body)    //newUser es un documento de mongoose. no un objeto. si hay errores al crear hay que manejarlos.
    res.status(201).json(newUser)
  }
  catch (err){
    console.log("Error creando usuario. faltan datos: ", err.message)
    res.status(400).json({message:'No se pudo crear. faltan datos o son incorrectos'})
  }
})

// Al actualizar un usuario:
userRouter.put ('/users/:uid', async (req, res) => {            //el id viene como parámetro
  const {uid} = req.params
  const {body} = req
  await Usermodel.updateOne({_id: uid}, {$set: body})     //actualizamos ese id con lo que traiga body mediante el operador $set, en la db.
  //res.status(204).json({ messaje: "usuario actualizado correctamente"}) no podemos porque debe responder la db, mongoose
  res.status(204).end() 
})

// Al borrar un usuario:
userRouter.delete ('/users/:uid', async (req, res) => {            //el id viene como parámetro
  const {uid} = req.params
  await Usermodel.deleteOne({_id: uid})     //borramos uno por id
  res.status(204).end() 
})

//module.exports = userRouter
export default userRouter