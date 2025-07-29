module.exports = {
  apps: [
    {
      name: 'founder-match-api',
      script: 'api/index.js',       // adjust if your entry differs
      cwd: '/home/azureuser/founder-match',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
