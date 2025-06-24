const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable fast refresh (HMR is enabled by default in Expo)
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

// Ensure resolver settings for better HMR
config.resolver = {
  ...config.resolver,
  unstable_enableSymlinks: false,
};

module.exports = config; 