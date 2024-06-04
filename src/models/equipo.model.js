import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"  //importamos el paginador

const equipoSchema = new mongoose.Schema({
  equipo: {type: String, required: true},           
  serie: {type: String, required: true},   
  fecha: {type: String, required: true},                //podría ser tipo fecha
  linea: {type: String, required: true}, 
  coche: {type: String, default: ""},
  problema: {type: String, required: true}, 
  caso: {type: String, unique: true,},
  entregado: {type: Boolean, default: false},        
}, {timestamps: true})    //para que guarde la fecha actual de creación.
equipoSchema.plugin(mongoosePaginate)  // insertamos el paginador como plugin
     
export const Equipomodel = mongoose.model('equipos', equipoSchema) 
//le pasamos el nombre de la Colección. siempre en minúsculas!!.
// Si usamos un nombre de colección ERRONEO nos CREARA una nueva colección y no funcionará la nuestra.
// Si usamos mayúsculas la pasará a minúsculas siempre y si ya existe una con mayúsculas CREARA una nueva con minusculas!!.
//Si en lugar de plural usamos singular mongoose le agregará la s final!!, esto puede ser útil pero conviene usar exactamente el mismo nombre que la colección, y en minúsculas.
//para importar en equipos.router.js



