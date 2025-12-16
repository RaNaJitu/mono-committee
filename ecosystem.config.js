/**
 * PM2 Ecosystem Configuration
 * Manages process clustering, monitoring, and auto-restart
 */

module.exports = {
  apps: [
    {
      name: 'committee-api',
      script: './dist/app.js',
      instances: 1, // Start with 1 instance (increase after fixing errors)
      exec_mode: 'cluster', // Enable cluster mode
      env: {
        NODE_ENV: 'DEVELOPMENT',
        UV_THREADPOOL_SIZE: '8', // Increase thread pool for crypto operations
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: 'PRODUCTION',
        UV_THREADPOOL_SIZE: '16', // More threads in production
        PORT: 4000,
      },
      // Auto-restart configuration
      autorestart: true,
      watch: false, // Set to true for development
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced PM2 features
      min_uptime: '10s', // Consider app stable after 10s
      max_restarts: 10, // Max restarts in 1 minute
      restart_delay: 4000, // Wait 4s before restart
    },
  ],
};

