import { z } from "zod";
import ErrorHandler from "../utils/errorHandler.js";

// Validation runner middleware
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Map Zod errors into a readable string
      const errorMessage = err.errors.map((e) => e.message).join(", ");
      return next(new ErrorHandler(`Validation Error: ${errorMessage}`, 400));
    }
    next(err);
  }
};
