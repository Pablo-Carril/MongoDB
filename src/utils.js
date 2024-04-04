import url from 'url'
import path from 'path'
import { DateTime } from 'luxon'

function formateaResultados(resultados) {
  const validadores = [];
  //Procesamos los datos de la DB:
  if (Array.isArray(resultados)) {    //si los resultados vienen en una lista...
    resultados.forEach((datos) => {
      let fecha = datos.fecha
      let fechaLuxon = DateTime.fromISO(fecha)
      let nuevaFecha = fechaLuxon.toFormat('dd/MM/yyyy')
      validadores.push({       //llenamos un nuevo array con un objeto
        ...datos.toObject(),   //convertimos el documento a objeto normal con todos sus datos
        fecha: nuevaFecha      //pero la fecha ahora será la modificada
      });
    })
    return validadores
  } else {                     //si el resultado es único (uno solo)...
    let fecha = resultados.fecha
    let fechaLuxon = DateTime.fromISO(fecha)
    let nuevaFecha = fechaLuxon.toFormat('dd/MM/yyyy')
    validadores.push({
      equipo: resultados.equipo,
      fecha: nuevaFecha,
      linea: resultados.linea,
      coche: resultados.coche,
      problema: resultados.problema,
      caso: resultados.caso
    })
    return validadores
  }
}

export const __filename = url.fileURLToPath(import.meta.url)    //de url a path
export const __dirname = path.dirname(__filename)             //obtenemos sólo la carpeta
export default formateaResultados

