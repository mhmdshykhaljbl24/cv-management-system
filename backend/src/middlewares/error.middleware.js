export function notFoundHandler(req, res, next) {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
}

export function globalErrorHandler(err, req, res, next) {
  console.error("ERROR:", err);

  const status = err.status || 500;

  res.status(status).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
