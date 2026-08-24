export function notFound(req, res) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Identificador invalido' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Registro duplicado' });
  }

  return res.status(statusCode).json({
    message: error.message || 'Error interno del servidor'
  });
}
