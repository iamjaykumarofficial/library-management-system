// Suppress specific deprecation warnings
process.removeAllListeners('warning');

process.on('warning', (warning) => {
  // Ignore the specific util._extend deprecation warning
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('util._extend')) {
    return;
  }
  // Show all other warnings
  console.warn(warning.name, warning.message);
});

// Import the main server
import('./server.js');