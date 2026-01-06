import { verifyAccessToken } from '../utils/tokens.js';
import { unauthorizedError, forbiddenError } from '../utils/response.js';

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedError(res, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return unauthorizedError(res, 'Invalid or expired token');
    }

    req.user = decoded;
    next();
  } catch (error) {
    return unauthorizedError(res, 'Authentication failed');
  }
};

// Check role permissions
export const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedError(res, 'User not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      return forbiddenError(res, 'Insufficient permissions');
    }

    next();
  };
};

// Optional authentication (for public routes that need user if logged in)
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};