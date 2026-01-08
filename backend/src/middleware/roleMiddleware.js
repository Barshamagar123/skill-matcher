import { checkRole } from './authMiddleware.js';

// Require YOUTH role
export const requireYouth = checkRole('YOUTH');

// Require EMPLOYER role
export const requireEmployer = checkRole('EMPLOYER');

// Require ADMIN role
export const requireAdmin = checkRole('ADMIN');
