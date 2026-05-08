import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import AppError from './utils/appError';
import { initializeDatabase } from './config/db';
import userRoutes from './routes/userRouter'
import container from './dependencyInjector/container';
const { scraperService } = container;
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, _res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

app.use('/api/user',userRoutes)

app.use('*', (req, _res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Global error handler - remove unused parameters
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error('Error:', err);
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    
    // Auto-scrape on server start
    console.log('Starting initial web scrape...');
    try {
      
      const result = await scraperService.scrapeAndSave();
      console.log(`✅ Initial scrape completed: ${result.message}`);
    } catch (error) {
      console.error('❌ Initial scrape failed:', error);
    }

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`Server started on port ${PORT}`);
      console.log('='.repeat(50));
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;