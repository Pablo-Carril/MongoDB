import mongoose from "mongoose";

const NotaSchema = new mongoose.Schema({
  contenido: String,
  fecha: { type: Date, default: Date.now }
});

export const NotaModel = mongoose.model('notas', NotaSchema)