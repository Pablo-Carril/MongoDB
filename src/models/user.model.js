import mongoose from "mongoose";

const userSchema = new mongoose.Schema({           //creamos nuestro Esquema de usuario. para mongoose, no para mongodb
  first_name: {type: String, required: true},    //esto permite que mongoose gestione los requerimientos
  last_name: {type: String, required: true},                 //hay otros como default: ""
  email: {type: String, unique: true, required: true},          //para que no exista otro usario con el mismo correo. que sea único.
}, {timestamps: true})    //para que guarde la fecha actual de creación (si queremos). no hace falta que creemos la nuestra a mano!.

export const Usermodel = mongoose.model('user', userSchema)    //creamos nuestro modelo y le pasamos la Colecction
//le pasamos el nombre de la Colección. siempre en minúsculas!!.
// Si usamos un nombre de colección ERRONEO nos CREARA una nueva colección y no funcionará la nuestra.
// Si usamos mayúsculas la pasará a minúsculas siempre y si ya existe una con mayúsculas CREARA una nueva con minusculas!!.
//Si en lugar de plural usamos singular mongoose le agregará la s final!!, esto puede ser útil pero conviene usar exactamente el mismo nombre que la colección, y en minúsculas.
//para importar en Validador.router.js