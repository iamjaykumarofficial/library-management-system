// Suppress specific deprecation warnings
process.removeAllListeners('warning');

process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('util._extend')) {
    // Ignore this specific warning
    return;
  }
  // Log other warnings
  console.warn(warning.name, warning.message);
});

// Import your main server
import('./server.js');