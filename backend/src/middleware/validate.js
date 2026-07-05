/**
 * Generic request validator. Pass a zod schema shaped like:
 *   z.object({ body: z.object({...}), params: z.object({...}), query: z.object({...}) })
 *
 * Usage:
 *   router.post("/login", validate(loginSchema), authController.login);
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    // Overwrite with parsed/sanitized data
    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    next();
  };
}

module.exports = validate;
