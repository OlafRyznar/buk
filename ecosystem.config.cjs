// PM2 process config for running BukScan as a normal Next.js server
// alongside other services (e.g. n8n) on the same VPS.
// Usage: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "buk",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
