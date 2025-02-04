import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { formatErrorResponse } from '../utils/jsonapi';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json(
      formatErrorResponse(400, 'Validation Error', err.message)
    );
  }

  // Handle invalid MongoDB IDs
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(
      formatErrorResponse(400, 'Invalid ID', 'The provided ID is invalid')
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      formatErrorResponse(401, 'Authentication Error', 'Invalid token')
    );
  }

  // Default error handling
  res.status(500).json(
    formatErrorResponse(500, 'Server Error', 'Something went wrong')
  );
};