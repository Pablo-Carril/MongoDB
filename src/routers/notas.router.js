import { Router } from 'express'
import { NotaModel} from '../models/notas.model.js'
import { DateTime } from 'luxon'
import {hoy, invertirFecha} from '../utils.js'
import { sessionControl } from '../middlewares/sessions.js'

const notasRouter = Router()

notasRouter.get('/notas', sessionControl, async (req, res) => {
  const notas = await NotaModel.find();
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


export default notasRouter