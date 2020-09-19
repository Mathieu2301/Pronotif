module.exports = {
  filenameHashing: false,
  outputDir: '../dist',
  pwa: {
    name: 'Pronotif',
    themeColor: '#007cde',
    msTileColor: '#007cde',
    workboxPluginMode: 'InjectManifest',
    assetsVersion: '1.1',
    manifestOptions: {
      background_color: '#007cde',
      display: 'standalone',
      icons: [
        {
          src: './img/logo-128.png',
          sizes: '128x128',
          type: 'image/png',
        },
        {
          src: './img/logo-256.png',
          sizes: '256x256',
          type: 'image/png',
        },
        {
          src: './img/logo-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      gcm_sender_id: '103953800507',
    },
    iconPaths: {
      favicon32: './img/logo-32.png',
      favicon16: './img/logo-16.png',
      appleTouchIcon: './img/logo-128.png',
      maskIcon: './img/logo.svg',
      msTileImage: './img/logo-256.png'
    },
    workboxOptions: {
      swSrc: 'sw.js',
    },
  },
  devServer: {
    disableHostCheck: true,
  },
};
