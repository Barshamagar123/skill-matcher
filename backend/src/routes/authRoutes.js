import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.post('/refresh-token', asyncHandler(AuthController.refreshToken));
router.post('/logout', asyncHandler(AuthController.logout));

// Protected routes (require authentication)
router.get('/me', verifyToken, asyncHandler(AuthController.getCurrentUser));
router.get('/check-auth', verifyToken, asyncHandler(AuthController.checkAuth));

// Role-based protected routes
router.get('/admin-only', 
  verifyToken, 
  checkRole('ADMIN'),
  (req, res) => {
    res.json({ 
      success: true,
      message: 'Admin access granted',
      user: req.user 
    });
  }
);

router.get('/employer-only',
  verifyToken,
  checkRole('EMPLOYER', 'ADMIN'),
  (req, res) => {
    res.json({ 
      success: true,
      message: 'Employer/Admin access granted',
      user: req.user 
    });
  }
);

router.get('/youth-only',
  verifyToken,
  checkRole('YOUTH', 'ADMIN'),
  (req, res) => {
    res.json({ 
      success: true,
      message: 'Youth/Admin access granted',
      user: req.user 
    });
  }
);

export default router;