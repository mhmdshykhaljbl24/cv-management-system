export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    if (result.data.body) {
      req.body = result.data.body;
    }

    if (result.data.params) {
      Object.assign(req.params, result.data.params);
    }

    if (result.data.query) {
      Object.assign(req.query, result.data.query);
    }

    next();
  };
}
