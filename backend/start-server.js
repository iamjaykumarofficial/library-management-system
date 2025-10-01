// Suppress specific deprecation warnings
import { emitWarning } from 'process';

// Suppress the specific util._extend deprecation warning
emitWarning('The `util._extend` API is deprecated.', 'DeprecationWarning', 'DEP0060');

// Import and start your main server
import('./server.js');