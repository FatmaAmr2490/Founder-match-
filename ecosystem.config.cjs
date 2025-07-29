// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'founder-match',
    script: 'server.js',
    cwd: '/home/azureuser/founder-match',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
