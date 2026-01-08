import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import config from './src/config/constants.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: config.CLIENT_URL,
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);  // Add this line
app.use('/api/jobs', jobRoutes);
// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
