import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"  //importamos el paginador

const camaraSchema = new mongoose.Schema({
  equipo: {type: String, required: true},           
  serie: {type: String, required: true},   
  fecha: {type: String, required: true},                //podría ser tipo fecha
  linea: {type: String, required: true}, 
  coche: {type: String, default: ""},
  problema: {type: String, required: true}, 
  caso: {type: String, unique: true,},
  entregado: {type: Boolean, default: false},        
}, {timestamps: true})    //para que guarde la fecha actual de creación.
camaraSchema.plugin(mongoosePaginate)  // insertamos el paginador como plugin
     
export const Camaramodel = mongoose.model('camaras', camaraSchema) 