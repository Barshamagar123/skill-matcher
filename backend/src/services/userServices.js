import prisma from '../config/prisma.js';

export class UserService {
  // Get user profile by ID
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        profileComplete: true,
        name: true,
        phone: true,
        bio: true,
        location: true,
        experienceLevel: true,
        education: true,
        interests: true,
        skills: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        companyProfile: true,  // For employers
        _count: {
          select: {
            applications: true,
            jobs: true  // For employers
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Parse JSON strings to arrays
    return {
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : [],
      interests: user.interests ? JSON.parse(user.interests) : []
    };
  }

  // Update user profile
  static async updateProfile(userId, data) {
    const updateData = { ...data };

    // Convert arrays to JSON strings for storage
    if (data.skills && Array.isArray(data.skills)) {
      updateData.skills = JSON.stringify(data.skills);
      updateData.profileComplete = true;
    }

    if (data.interests && Array.isArray(data.interests)) {
      updateData.interests = JSON.stringify(data.interests);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        bio: true,
        location: true,
        experienceLevel: true,
        education: true,
        interests: true,
        skills: true,
        profileComplete: true,
        updatedAt: true
      }
    });

    // Parse JSON strings back to arrays
    return {
      ...updatedUser,
      skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
      interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : []
    };
  }

  // Update skills (for AI vector generation)
  static async updateSkills(userId, skills) {
    if (!Array.isArray(skills)) {
      throw new Error('Skills must be an array');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        skills: JSON.stringify(skills),
        profileComplete: skills.length > 0
      },
      select: {
        id: true,
        email: true,
        role: true,
        skills: true,
        profileComplete: true
      }
    });

    return {
      ...updatedUser,
      skills: JSON.parse(updatedUser.skills)
    };
  }

  // Get user skills
  static async getSkills(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skills: true,
        skillVector: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      skills: user.skills ? JSON.parse(user.skills) : [],
      skillVector: user.skillVector ? JSON.parse(user.skillVector) : null
    };
  }

  // Update skill vector (for AI matching)
  static async updateSkillVector(userId, skillVector) {
    if (!Array.isArray(skillVector)) {
      throw new Error('Skill vector must be an array');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        skillVector: JSON.stringify(skillVector)
      }
    });

    return { success: true, message: 'Skill vector updated' };
  }

  // Delete user account
  static async deleteAccount(userId) {
    await prisma.user.delete({
      where: { id: userId }
    });

    return { success: true, message: 'Account deleted successfully' };
  }

  // Search users by skills (for employers)
  static async searchBySkills(skills, limit = 10) {
    if (!Array.isArray(skills) || skills.length === 0) {
      throw new Error('Skills array is required');
    }

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        role: 'YOUTH',
        profileComplete: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        location: true,
        experienceLevel: true,
        education: true,
        bio: true
      },
      take: 100 // Limit initial query
    });

    // Filter users who have at least one matching skill
    const filteredUsers = users.filter(user => {
      const userSkills = user.skills ? JSON.parse(user.skills) : [];
      return skills.some(skill => userSkills.includes(skill));
    });

    // Sort by number of matching skills
    const sortedUsers = filteredUsers.sort((a, b) => {
      const aSkills = a.skills ? JSON.parse(a.skills) : [];
      const bSkills = b.skills ? JSON.parse(b.skills) : [];
      const aMatches = skills.filter(skill => aSkills.includes(skill)).length;
      const bMatches = skills.filter(skill => bSkills.includes(skill)).length;
      return bMatches - aMatches;
    });

    // Parse skills for response
    return sortedUsers.slice(0, limit).map(user => ({
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : []
    }));
  }

  // Get user statistics
  static async getStats(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'YOUTH') {
      const stats = await prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true
      });

      const totalApplications = await prisma.application.count({
        where: { userId }
      });

      return {
        totalApplications,
        statusBreakdown: stats.reduce((acc, curr) => {
          acc[curr.status.toLowerCase()] = curr._count;
          return acc;
        }, {}),
        role: 'YOUTH'
      };
    } else if (user.role === 'EMPLOYER') {
      const totalJobs = await prisma.job.count({
        where: { employerId: userId }
      });

      const totalApplications = await prisma.application.count({
        where: {
          job: {
            employerId: userId
          }
        }
      });

      return {
        totalJobs,
        totalApplications,
        role: 'EMPLOYER'
      };
    }

    return { role: user.role };
  }
}