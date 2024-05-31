import { Router } from 'express'
import { NotaModel} from '../models/notas.model.js'
import { DateTime } from 'luxon'
import {hoy, invertirFecha} from '../utils.js'
import { sessionControl } from '../middlewares/sessions.js'

const notasRouter = Router()

notasRouter.get('/notas', sessionControl, async (req, res) => {
  const notas = await NotaModel.find().sort({ _id: -1 })
  res.render('notas', {notas})                      
  res.status(200)
})

notasRouter.post('/notas', async (req, res) => {
  const nuevaNota = new NotaModel({
    contenido: req.body.contenido,
    fecha: invertirFecha(hoy())
  });
  await nuevaNota.save();
  res.redirect('/notas');
});

notasRouter.delete('/notas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await NotaModel.findByIdAndDelete(id);
    res.status(200).send({ message: 'Nota eliminada' });
  } catch (error) {
    console.error('Error al eliminar la nota:', error);
    res.status(500).send('Error al eliminar la nota');
  }
});

notasRouter.put('/notas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const nuevoContenido = req.body.contenido;
    const notaActualizada = await NotaModel.findByIdAndUpdate(id, { contenido: nuevoContenido }, { new: true });
    res.status(200).send(notaActualizada);
  } catch (error) {
    console.error('Error al actualizar la nota:', error);
    res.status(500).send('Error al actualizar la nota');
  }
});

export default notasRouter