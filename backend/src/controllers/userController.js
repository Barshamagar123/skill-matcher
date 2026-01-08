import { UserService } from '../services/userServices.js';
import { CompanyService } from '../services/companyServices.js';
import { successResponse, errorResponse, validationError } from '../utils/response.js';

export class UserController {
  // Get current user profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await UserService.getProfile(userId);
      
      return successResponse(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const data = req.body;

      // Validation
      const errors = {};
      
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please provide a valid email';
      }

      if (data.phone && !/^[0-9+\-\s()]{10,}$/.test(data.phone)) {
        errors.phone = 'Please provide a valid phone number';
      }

      if (Object.keys(errors).length > 0) {
        return validationError(res, errors);
      }

      const updatedUser = await UserService.updateProfile(userId, data);
      
      return successResponse(res, 'Profile updated successfully', { user: updatedUser });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Update skills
  static async updateSkills(req, res) {
    try {
      const userId = req.user.userId;
      const { skills } = req.body;

      if (!skills || !Array.isArray(skills)) {
        return errorResponse(res, 'Skills array is required', 400);
      }

      const updatedUser = await UserService.updateSkills(userId, skills);
      
      return successResponse(res, 'Skills updated successfully', { user: updatedUser });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get user skills
  static async getSkills(req, res) {
    try {
      const userId = req.user.userId;
      const skillsData = await UserService.getSkills(userId);
      
      return successResponse(res, 'Skills retrieved successfully', skillsData);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get user statistics
  static async getStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await UserService.getStats(userId);
      
      return successResponse(res, 'Statistics retrieved successfully', { stats });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Delete account
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      const result = await UserService.deleteAccount(userId);
      
      return successResponse(res, result.message);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Search users by skills (for employers)
  static async searchBySkills(req, res) {
    try {
      const { skills, limit } = req.body;
      
      if (!skills || !Array.isArray(skills)) {
        return errorResponse(res, 'Skills array is required', 400);
      }

      const users = await UserService.searchBySkills(skills, limit || 10);
      
      return successResponse(res, 'Users found successfully', { users });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // ============ COMPANY PROFILE ENDPOINTS ============

  // Create or update company profile
  static async upsertCompanyProfile(req, res) {
    try {
      const userId = req.user.userId;
      const data = req.body;

      // Validation
      if (!data.companyName) {
        return errorResponse(res, 'Company name is required', 400);
      }

      const companyProfile = await CompanyService.upsertCompanyProfile(userId, data);
      
      return successResponse(res, 'Company profile saved successfully', { companyProfile });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get company profile
  static async getCompanyProfile(req, res) {
    try {
      const userId = req.user.userId;
      const companyProfile = await CompanyService.getCompanyProfile(userId);
      
      return successResponse(res, 'Company profile retrieved successfully', { companyProfile });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Get company by ID (public)
  static async getCompanyById(req, res) {
    try {
      const { companyId } = req.params;
      const companyProfile = await CompanyService.getCompanyById(companyId);
      
      return successResponse(res, 'Company retrieved successfully', { companyProfile });
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }

  // Delete company profile
  static async deleteCompanyProfile(req, res) {
    try {
      const userId = req.user.userId;
      const result = await CompanyService.deleteCompanyProfile(userId);
      
      return successResponse(res, result.message);
    } catch (error) {
      return errorResponse(res, error.message);
    }
  }
}