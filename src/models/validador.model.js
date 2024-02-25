import mongoose from "mongoose";

const validadorSchema = new mongoose.Schema({           
  serie: {type: String, required: true},   
  fecha: {type: String, required: true},                //podría ser tipo fecha
  linea: {type: String, required: true}, 
  coche: {type: String, default: ""},
  problema: {type: String, required: true}, 
  caso: {type: String, unique: true,},        
}, {timestamps: true})    //para que guarde la fecha actual de creación.

export const Validadormodel = mongoose.model('validadores', validadorSchema) //le pasamos el nombre de la Colección. siempre en minúsculas!!.
// Si usamos un nombre de colección ERRONEO nos CREARA una nueva colección y no funcionará la nuestra.
// Si usamos mayúsculas la pasará a minúsculas siempre y si ya existe una con mayúsculas CREARA una nueva con minusculas!!.
//Si en lugar de plural usamos singular mongoose le agregará la s final!!, esto puede ser útil pero conviene usar exactamente el mismo nombre que la colección, y en minúsculas.
//para importar en Validador.router.js



