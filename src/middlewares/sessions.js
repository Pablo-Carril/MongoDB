//MIDDLEWARES:

// Middleware para verificar si la sesión está registrada. agregar a todas las rutas que necesitemos proteger.
export const sessionControl = (req, res, next) => {
    if (!req.session.logeado) { // Si el usuario no está logueado
      res.redirect('/'); // Redirecciona a la página de inicio
    } else {
      next(); // Continúa con el siguiente middleware si está logueado
    }
  };
  