import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import transcriptionRoutes from './routes/transcription';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:8081',
    'http://localhost:19000',
    'http://localhost:19006',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Lectra backend server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/transcription', transcriptionRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎙️  Lectra Backend Server                              ║
║                                                           ║
║   Status: Running                                         ║
║   Port: ${PORT}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Time: ${new Date().toLocaleString()}                  ║
║                                                           ║
║   Endpoints:                                              ║
║   - GET  /health                                          ║
║   - GET  /api/transcription/health                        ║
║   - POST /api/transcription/transcribe                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Verify Google Cloud credentials
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(`
⚠️  WARNING: GOOGLE_APPLICATION_CREDENTIALS not set
   Please set this environment variable to enable transcription.
   Example: GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-cloud-key.json
    `);
  } else {
    console.log(`✅ Google Cloud credentials configured`);
  }
});

export default app;
