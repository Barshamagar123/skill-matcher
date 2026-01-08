import { JobService } from '../services/jobServices.js';
import { successResponse, errorResponse, validationError } from '../utils/response.js';

export class JobController {
  // Create a new job (Employer only)
  static async createJob(req, res) {
    try {
      const employerId = req.user.userId;
      const jobData = req.body;

      // Validation
      const errors = {};

      if (!jobData.title || jobData.title.trim().length < 3) {
        errors.title = 'Job title must be at least 3 characters';
      }

      if (!jobData.description || jobData.description.trim().length < 10) {
        errors.description = 'Job description must be at least 10 characters';
      }

      if (!jobData.jobType || !['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'REMOTE'].includes(jobData.jobType)) {
        errors.jobType = 'Valid job type is required';
      }

      if (!jobData.requiredSkills || !Array.isArray(jobData.requiredSkills) || jobData.requiredSkills.length === 0) {
        errors.requiredSkills = 'At least one required skill is needed';
      }

      if (Object.keys(errors).length > 0) {
        return validationError(res, errors);
      }

      const job = await JobService.createJob(employerId, jobData);

      return successResponse(res, 'Job created successfully', { job }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Get all jobs (Public - with filters)
  static async getAllJobs(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        jobType: req.query.jobType,
        location: req.query.location,
        experience: req.query.experience,
        minSalary: req.query.minSalary,
        maxSalary: req.query.maxSalary,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const userId = req.user ? req.user.userId : null;
      const result = await JobService.getAllJobs(filters, userId);

      return successResponse(res, 'Jobs retrieved successfully', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get job by ID (Public)
  static async getJobById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.userId : null;

      const job = await JobService.getJobById(id, userId);

      return successResponse(res, 'Job retrieved successfully', { job });
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  // Get employer's jobs
  static async getEmployerJobs(req, res) {
    try {
      const employerId = req.user.userId;
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
      };

      const result = await JobService.getEmployerJobs(employerId, filters);

      return successResponse(res, 'Employer jobs retrieved successfully', result);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Update job (Employer only)
  static async updateJob(req, res) {
    try {
      const { id } = req.params;
      const employerId = req.user.userId;
      const updateData = req.body;

      const job = await JobService.updateJob(id, employerId, updateData);

      return successResponse(res, 'Job updated successfully', { job });
    } catch (error) {
      return errorResponse(res, error.message, 403);
    }
  }

  // Delete job (Employer only - soft delete)
  static async deleteJob(req, res) {
    try {
      const { id } = req.params;
      const employerId = req.user.userId;

      const result = await JobService.deleteJob(id, employerId);

      return successResponse(res, result.message);
    } catch (error) {
      return errorResponse(res, error.message, 403);
    }
  }

  // Get employer dashboard stats
  static async getEmployerDashboard(req, res) {
    try {
      const employerId = req.user.userId;
      
      const stats = await JobService.getEmployerDashboardStats(employerId);

      return successResponse(res, 'Dashboard stats retrieved successfully', { stats });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Search jobs by skills (for youth)
  static async searchJobsBySkills(req, res) {
    try {
      const { skills } = req.body;
      const userId = req.user ? req.user.userId : null;

      if (!skills || !Array.isArray(skills)) {
        return errorResponse(res, 'Skills array is required', 400);
      }

      const jobs = await JobService.searchJobsBySkills(skills, userId);

      return successResponse(res, 'Jobs found successfully', { jobs });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get job categories/types (Public)
  static async getJobCategories(req, res) {
    try {
      const categories = await JobService.getJobCategories();

      return successResponse(res, 'Job categories retrieved successfully', { categories });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get recommended jobs for youth (based on skills)
  static async getRecommendedJobs(req, res) {
    try {
      const userId = req.user.userId;
      
      // Get user skills
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true },
      });

      if (!user || !user.skills) {
        return successResponse(res, 'No skills found for recommendations', { jobs: [] });
      }

      const userSkills = JSON.parse(user.skills);
      const jobs = await JobService.searchJobsBySkills(userSkills, userId);

      // Get top 10 matches
      const recommendedJobs = jobs.slice(0, 10);

      return successResponse(res, 'Recommended jobs retrieved successfully', { jobs: recommendedJobs });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}