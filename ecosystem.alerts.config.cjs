// PM2 config for the standalone alerts worker (scraper + n8n notifier).
// Runs independently of the static FTP-hosted frontend — only this process
// needs to live on the VPS for alerts to work.
// Usage: pm2 start ecosystem.alerts.config.cjs
module.exports = {
  apps: [
    {
      name: "buk-alerts-worker",
      script: "node_modules/.bin/tsx",
      args: "scripts/alerts-worker.ts",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
