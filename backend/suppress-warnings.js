// Suppress specific warnings before starting the server
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('util._extend')) {
    return; // Ignore this specific warning
  }
  console.warn(warning.name, warning.message);
});