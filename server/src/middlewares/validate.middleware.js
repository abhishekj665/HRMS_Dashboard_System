export const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property] ?? {}, {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.details.map(({ message }) => message).join("; "),
      });
    }

    req[property] = value;
    next();
  };
