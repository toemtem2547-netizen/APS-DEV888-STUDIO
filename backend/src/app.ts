import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/authRoutes';
import packageRoutes from './routes/packageRoutes';
import mysteryBoxRoutes from './routes/mysteryBoxRoutes';
import orderRoutes from './routes/orderRoutes';
import walletRoutes from './routes/walletRoutes';
import promotionRoutes from './routes/promotionRoutes';
import rewardRoutes from './routes/rewardRoutes';
import settingsRoutes from './routes/settingsRoutes';
import gachaRoutes from './routes/gachaRoutes';
import wheelRoutes from './routes/wheelRoutes';
import slotRoutes from './routes/slotRoutes';
import adminRoutes from './routes/adminRoutes';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*', // Allow both frontend (5173) and backoffice (5174)
    credentials: true,
  }));
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use(morgan('dev'));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      service: 'Game Top-up & Mystery Box Platform API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/packages', packageRoutes);
  app.use('/api/mystery-boxes', mysteryBoxRoutes);
  app.use('/api/gacha', gachaRoutes);
  app.use('/api/wheel', wheelRoutes);
  app.use('/api/slot', slotRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/promotions', promotionRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });

  return app;
}
