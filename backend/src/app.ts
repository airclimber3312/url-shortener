import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import mainRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { connectDB } from './config/db';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Create Express app
const app = express();

// Database connection
connectDB(process.env.MONGODB_URI!);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost',        // Frontend origin
    'http://localhost:80',    // Common frontend port
    'http://localhost:3000'   // Development server
  ],
  exposedHeaders: ['Authorization']
}));
app.options('*', cors()); 
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(mainRouter);

// Error handling (must be last middleware)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(false).then(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

export default app;