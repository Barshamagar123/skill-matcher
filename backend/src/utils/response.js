export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const unauthorizedError = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

export const forbiddenError = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

export const validationError = (res, errors) => {
  return errorResponse(res, 'Validation failed', 400, errors);
};
