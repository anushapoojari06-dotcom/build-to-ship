export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid input format',
      details: err.errors
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'Audio file too large. Maximum size is 10MB.'
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
}
