import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import labelRoutes from './routes/labelRoutes.js';
import userRoutes from './routes/userRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import timeLogRoutes from './routes/timeLogRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import emailTemplateRoutes from './routes/emailTemplateRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import callLogRoutes from './routes/callLogRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { emailService } from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// CORS configuration - allow frontend domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin matches any allowed origin or ends with railway.app
      if (allowedOrigins.includes(origin) || origin.endsWith('.railway.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    message: 'HAV Project Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'HAV API is running' });
});

app.get('/api/test-smtp', async (_req, res) => {
  try {
    const isConnected = await emailService.verifyConnection();
    res.json({
      connected: isConnected,
      message: isConnected
        ? 'SMTP connection successful'
        : 'SMTP connection failed - check server logs',
      config: {
        host: process.env.SMTP_HOST || 'smtp.domeneshop.no',
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER || 'Not configured',
      },
    });
  } catch (error) {
    res.status(500).json({
      connected: false,
      message: 'SMTP connection error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/timelogs', timeLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/call-logs', callLogRoutes);
app.use('/api/meetings', meetingRoutes);

app.use('/api', (_req, res) => {
  res.json({ message: 'HAV Project Management API' });
});

app.use(errorHandler);

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
