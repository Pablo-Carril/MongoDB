import dotenv from 'dotenv'
dotenv.config()

import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

//const URI = 'mongodb://localhost:27017/Equipos'  //pongo la URi + /Equipos que es la base de datos. por default usa la base test. por eso no da error.
//La URI la obtenemos desde Conection String de ATLAS, o en mongosh db.getMongo().

export const initdb = async ()=> {
  try {
    await mongoose.connect(URI)
    console.log("Base de datos conectada OK")
  }
  catch (err) {
   console.error("Error al conectarse a la DB: ", err.message)
  }

}
