import { AuthService } from '../services/authService.js';
import { validateRegistration, validateLogin } from '../utils/validators.js';
import { successResponse, errorResponse, validationError } from '../utils/response.js';

export class AuthController {
  // Register User with optional profile fields
  static async register(req, res) {
    try {
      const { email, password, role, name, phone, location } = req.body;

      // Validate input
      const validation = validateRegistration(req.body);
      if (!validation.isValid) {
        return validationError(res, validation.errors);
      }

      // Register user with optional profile data
      const result = await AuthService.register({ 
        email, 
        password, 
        role,
        name,
        phone,
        location 
      });

      return successResponse(
        res,
        'Registration successful',
        {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
        201
      );
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Login User
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      const validation = validateLogin(req.body);
      if (!validation.isValid) {
        return validationError(res, validation.errors);
      }

      // Login user
      const result = await AuthService.login(email, password);

      return successResponse(res, 'Login successful', {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }

  // Refresh Token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400);
      }

      const result = await AuthService.refreshToken(refreshToken);

      return successResponse(res, 'Token refreshed', {
        accessToken: result.accessToken,
      });
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }

  // Logout
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      return successResponse(res, 'Logged out successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Get Current User (using AuthService for now)
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;
      const user = await AuthService.getCurrentUser(userId);

      return successResponse(res, 'User retrieved successfully', { user });
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  // Check Auth Status
  static async checkAuth(req, res) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Not authenticated', 401);
      }

      return successResponse(res, 'Authenticated', {
        user: req.user,
      });
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}