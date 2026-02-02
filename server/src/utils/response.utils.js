export const successResponse = (
  res,
  data,
  message = "Success",
  status = 200,
) => {
  const result = res.status(status).json({
    success: true,
    message,
    data,
  });

  return result;
};

export const errorResponse = (res, message, status = 400) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
