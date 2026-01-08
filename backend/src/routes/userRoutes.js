import express from 'express';
import { UserController } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireYouth, requireEmployer } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ============ GENERAL USER ROUTES ============
// GET /api/users/me - Get current user profile
router.get('/me', asyncHandler(UserController.getProfile));

// PUT /api/users/me - Update user profile
router.put('/me', asyncHandler(UserController.updateProfile));

// GET /api/users/stats - Get user statistics
router.get('/stats', asyncHandler(UserController.getStats));

// DELETE /api/users/me - Delete account
router.delete('/me', asyncHandler(UserController.deleteAccount));

// ============ SKILLS ROUTES ============
// GET /api/users/skills - Get user skills
router.get('/skills', asyncHandler(UserController.getSkills));

// PUT /api/users/skills - Update skills
router.put('/skills', asyncHandler(UserController.updateSkills));

// ============ COMPANY PROFILE ROUTES (Employer only) ============
// GET /api/users/company - Get company profile
router.get('/company', requireEmployer, asyncHandler(UserController.getCompanyProfile));

// PUT /api/users/company - Create/update company profile
router.put('/company', requireEmployer, asyncHandler(UserController.upsertCompanyProfile));

// DELETE /api/users/company - Delete company profile
router.delete('/company', requireEmployer, asyncHandler(UserController.deleteCompanyProfile));

// ============ PUBLIC COMPANY ROUTES ============
// GET /api/users/company/:companyId - Get company by ID (public)
router.get('/company/:companyId', asyncHandler(UserController.getCompanyById));

// ============ EMPLOYER ONLY ROUTES ============
// POST /api/users/search-by-skills - Search youth by skills
router.post('/search-by-skills', requireEmployer, asyncHandler(UserController.searchBySkills));

export default router;