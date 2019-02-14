module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/server.js',
      env: {
        NODE_ENV: 'dev',
      },
      env_staging: {
        NODE_ENV: 'staging',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
