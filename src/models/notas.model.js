import mongoose from "mongoose";

const NotaSchema = new mongoose.Schema({
  contenido: String,
  fecha: {type: String,},
});

export const NotaModel = mongoose.model('notas', NotaSchema)