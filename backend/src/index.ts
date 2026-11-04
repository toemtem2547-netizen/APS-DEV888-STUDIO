import { createApp } from './app';
import { ENV } from './config/env';
import { initDatabaseConnection } from './config/db';
import { runMigrations } from './utils/dbMigrate';

async function bootstrap() {
  try {
    console.log('Connecting to database...');
    await initDatabaseConnection();
    await runMigrations();

    const app = createApp();
    app.listen(ENV.PORT, () => {
      console.log(`====================================================`);
      console.log(`⚡ Game Top-up Backend API is running!`);
      console.log(`📡 URL: http://localhost:${ENV.PORT}`);
      console.log(`🛡️  Health check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err: any) {
    console.error('Fatal startup error:', err.message);
    process.exit(1);
  }
}

bootstrap();
