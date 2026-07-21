import ErrorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";

export default (err, req, res, next) => {
  let error = {
    statusCode: err?.statusCode || 500,
    message: err?.message || "Internal Server Error",
  };

  // Handle Invalid Mongoose ID Error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err?.path}`;
    error = new ErrorHandler(message, 404);
  }

  // Handle Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorHandler(message, 400);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const message = `An account with that ${Object.keys(err.keyValue)} already exists`;
    error = new ErrorHandler(message, 400);
  }

  // Handle wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid. Try Again!!!";
    error = new ErrorHandler(message, 401);
  }

  // Handle JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token is expired. Try Again!!!";
    error = new ErrorHandler(message, 401);
  }

  const env = process.env.NODE_ENV?.toLowerCase() || "development";

  // Log the error
  if (error.statusCode >= 500) {
    logger.error("Internal Server Error", err, { path: req.path, method: req.method });
  } else if (env === "development") {
    logger.info(`Client Error: ${error.message}`, { path: req.path, method: req.method, status: error.statusCode });
  }

  if (env === "development") {
    res.status(error.statusCode).json({
      message: error.message,
      error: err,
      stack: err?.stack,
    });
  } else {
    // Production response
    res.status(error.statusCode).json({
      message: `${error.message} ${err?.message && error.statusCode < 500 ? `| ${err.message}` : ''}`,
      errorDetail: error.statusCode < 500 ? err?.message : undefined,
    });
  }
};
