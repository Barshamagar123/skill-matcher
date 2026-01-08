import express from 'express';
import { JobController } from '../controllers/jobController.js';
import { verifyToken, optionalAuth } from '../middleware/authMiddleware.js';
import { requireEmployer, requireYouth } from '../middleware/roleMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============
// GET /api/jobs - Get all jobs (with filters)
router.get('/', optionalAuth, asyncHandler(JobController.getAllJobs));

// GET /api/jobs/:id - Get job by ID
router.get('/:id', optionalAuth, asyncHandler(JobController.getJobById));

// GET /api/jobs/categories - Get job categories
router.get('/categories', asyncHandler(JobController.getJobCategories));

// ============ EMPLOYER ROUTES ============
// POST /api/jobs - Create job (Employer only)
router.post('/', verifyToken, requireEmployer, asyncHandler(JobController.createJob));

// GET /api/jobs/employer/my-jobs - Get employer's jobs
router.get('/employer/my-jobs', verifyToken, requireEmployer, asyncHandler(JobController.getEmployerJobs));

// PUT /api/jobs/:id - Update job (Employer only)
router.put('/:id', verifyToken, requireEmployer, asyncHandler(JobController.updateJob));

// DELETE /api/jobs/:id - Delete job (Employer only)
router.delete('/:id', verifyToken, requireEmployer, asyncHandler(JobController.deleteJob));

// GET /api/jobs/employer/dashboard - Employer dashboard stats
router.get('/employer/dashboard', verifyToken, requireEmployer, asyncHandler(JobController.getEmployerDashboard));

// ============ YOUTH ROUTES ============
// POST /api/jobs/search-by-skills - Search jobs by skills
router.post('/search-by-skills', verifyToken, requireYouth, asyncHandler(JobController.searchJobsBySkills));

// GET /api/jobs/youth/recommended - Get recommended jobs for youth
router.get('/youth/recommended', verifyToken, requireYouth, asyncHandler(JobController.getRecommendedJobs));

export default router;