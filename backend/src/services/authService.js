import prisma from '../config/prisma.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiry,
  verifyRefreshToken,
} from '../utils/tokens.js';

export class AuthService {
  // Register new user WITH profile fields
  static async register(userData) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Prepare user data
    const userCreateData = {
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'YOUTH',
      isVerified: true, // Auto-verify for hackathon
      profileComplete: false, // Will be true when they add profile info
    };

    // Add optional profile fields if provided during registration
    if (userData.name) userCreateData.name = userData.name;
    if (userData.phone) userCreateData.phone = userData.phone;
    if (userData.location) userCreateData.location = userData.location;

    // Create user
    const user = await prisma.user.create({
      data: userCreateData,
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        location: true,
        isVerified: true,
        profileComplete: true,
        createdAt: true,
      },
    });

    // Generate tokens for immediate login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getTokenExpiry(7 * 24), // 7 days
      },
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Login user with full profile data
  static async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getTokenExpiry(7 * 24), // 7 days
      },
    });

    // Return complete user data
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      experienceLevel: user.experienceLevel,
      education: user.education,
      isVerified: user.isVerified,
      profileComplete: user.profileComplete,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      // Parse JSON fields
      skills: user.skills ? JSON.parse(user.skills) : [],
      interests: user.interests ? JSON.parse(user.interests) : [],
    };

    return {
      user: userData,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  // Refresh access token
  static async refreshToken(refreshToken) {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw new Error('Refresh token expired or invalid');
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.user);

    return { accessToken };
  }

  // Logout user (remove refresh token)
  static async logout(refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Logout all sessions for user
  static async logoutAll(userId) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  // Get current user with complete profile
  static async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyProfile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Format response
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      experienceLevel: user.experienceLevel,
      education: user.education,
      isVerified: user.isVerified,
      profileComplete: user.profileComplete,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // Parse JSON fields
      skills: user.skills ? JSON.parse(user.skills) : [],
      interests: user.interests ? JSON.parse(user.interests) : [],
      // Include company profile for employers
      companyProfile: user.companyProfile,
    };

    return userData;
  }

  // Update user profile (moved to UserService, kept for compatibility)
  static async updateProfile(userId, data) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        role: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}