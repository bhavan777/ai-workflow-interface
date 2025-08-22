module.exports = {
  apps: [{
    name: 'ai-workflow-server',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    args: '--crash-restart',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Restart on crash
    max_restarts: 10,
    min_uptime: '10s',
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Health check
    health_check_grace_period: 3000,
    // Auto restart conditions
    restart_delay: 4000,
    exp_backoff_restart_delay: 100
  }]
};
