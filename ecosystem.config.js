module.exports = {
  apps: [{
    name: 'Pronotif Server',
    script: 'main.js',
    max_memory_restart: '300M',
    env: {
      PORT: 500,
      production: false,
      notifications: false,
    },
  }],
};
