module.exports = {
  apps: [
    {
      name: 'op-tracker',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      }
    }
  ]
};
