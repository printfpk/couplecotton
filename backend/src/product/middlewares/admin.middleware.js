import createAuthMiddleware from './auth.middleware.js';

// The createAuthMiddleware already handles JWT verification and role checking.
// We just pass the 'admin' role to it.
const requireAdmin = createAuthMiddleware(['admin']);

export default requireAdmin;
