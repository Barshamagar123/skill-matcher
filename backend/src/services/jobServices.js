import prisma from '../config/prisma.js';

export class JobService {
  // Create a new job
  static async createJob(employerId, jobData) {
    // Validate required skills
    if (!jobData.requiredSkills || !Array.isArray(jobData.requiredSkills)) {
      throw new Error('Required skills must be an array');
    }

    const job = await prisma.job.create({
      data: {
        employerId,
        title: jobData.title,
        description: jobData.description,
        jobType: jobData.jobType,
        location: jobData.location,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        experienceReq: jobData.experienceReq,
        deadline: jobData.deadline ? new Date(jobData.deadline) : null,
        requiredSkills: JSON.stringify(jobData.requiredSkills),
        isActive: true,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyProfile: true,
          },
        },
      },
    });

    return {
      ...job,
      requiredSkills: JSON.parse(job.requiredSkills),
    };
  }

  // Get job by ID
  static async getJobById(jobId, userId = null) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyProfile: true,
          },
        },
        applications: userId
          ? {
              where: { userId },
              select: {
                id: true,
                status: true,
                appliedAt: true,
                matchPercentage: true,
              },
            }
          : false,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Increment view count
    await prisma.job.update({
      where: { id: jobId },
      data: { views: { increment: 1 } },
    });

    return {
      ...job,
      requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
    };
  }

  // Get all jobs (with filters)
  static async getAllJobs(filters = {}, userId = null) {
    const {
      page = 1,
      limit = 10,
      search = '',
      jobType,
      location,
      experience,
      minSalary,
      maxSalary,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(jobType && { jobType }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(experience && { experienceReq: experience }),
      ...(minSalary && { salaryMin: { gte: parseInt(minSalary) } }),
      ...(maxSalary && { salaryMax: { lte: parseInt(maxSalary) } }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              companyProfile: {
                select: {
                  companyName: true,
                  logo: true,
                  industry: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    // Parse skills for each job
    const parsedJobs = jobs.map((job) => ({
      ...job,
      requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
    }));

    return {
      jobs: parsedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get employer's jobs
  static async getEmployerJobs(employerId, filters = {}) {
    const { page = 1, limit = 10, status = 'active' } = filters;
    const skip = (page - 1) * limit;

    const where = {
      employerId,
      ...(status === 'active' && { isActive: true }),
      ...(status === 'inactive' && { isActive: false }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
          applications: {
            take: 5,
            orderBy: { matchPercentage: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  skills: true,
                  experienceLevel: true,
                },
              },
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    const parsedJobs = jobs.map((job) => ({
      ...job,
      requiredSkills: job.requiredSkills ? JSON.parse(job.requiredSkills) : [],
      applications: job.applications.map((app) => ({
        ...app,
        user: {
          ...app.user,
          skills: app.user.skills ? JSON.parse(app.user.skills) : [],
        },
      })),
    }));

    return {
      jobs: parsedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        active: await prisma.job.count({
          where: { employerId, isActive: true },
        }),
        totalApplications: await prisma.application.count({
          where: {
            job: { employerId },
          },
        }),
      },
    };
  }

  // Update job
  static async updateJob(jobId, employerId, updateData) {
    // Check if job belongs to employer
    const job = await prisma.job.findFirst({
      where: { id: jobId, employerId },
    });

    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    const dataToUpdate = { ...updateData };
    
    // Convert skills array to JSON string if provided
    if (updateData.requiredSkills && Array.isArray(updateData.requiredSkills)) {
      dataToUpdate.requiredSkills = JSON.stringify(updateData.requiredSkills);
    }

    // Convert deadline string to Date if provided
    if (updateData.deadline) {
      dataToUpdate.deadline = new Date(updateData.deadline);
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: dataToUpdate,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            companyProfile: true,
          },
        },
      },
    });

    return {
      ...updatedJob,
      requiredSkills: updatedJob.requiredSkills ? JSON.parse(updatedJob.requiredSkills) : [],
    };
  }

  // Delete job (soft delete - set inactive)
  static async deleteJob(jobId, employerId) {
    // Check if job belongs to employer
    const job = await prisma.job.findFirst({
      where: { id: jobId, employerId },
    });

    if (!job) {
      throw new Error('Job not found or unauthorized');
    }

    // Soft delete - set inactive
    await prisma.job.update({
      where: { id: jobId },
      data: { isActive: false },
    });

    return { success: true, message: 'Job deleted successfully' };
  }

  // Get job statistics for employer dashboard
  static async getEmployerDashboardStats(employerId) {
    const totalJobs = await prisma.job.count({
      where: { employerId },
    });

    const activeJobs = await prisma.job.count({
      where: { employerId, isActive: true },
    });

    const totalApplications = await prisma.application.count({
      where: {
        job: { employerId },
      },
    });

    // Applications by status
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: {
        job: { employerId },
      },
      _count: true,
    });

    // Recent applications (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentApplications = await prisma.application.count({
      where: {
        job: { employerId },
        appliedAt: { gte: weekAgo },
      },
    });

    // Jobs by type
    const jobsByType = await prisma.job.groupBy({
      by: ['jobType'],
      where: { employerId },
      _count: true,
    });

    // Top skills in applications (from user skills)
    const applications = await prisma.application.findMany({
      where: {
        job: { employerId },
      },
      include: {
        user: {
          select: {
            skills: true,
          },
        },
      },
      take: 100, // Limit for performance
    });

    const skillFrequency = {};
    applications.forEach((app) => {
      if (app.user.skills) {
        const skills = JSON.parse(app.user.skills);
        skills.forEach((skill) => {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });
      }
    });

    const topSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      recentApplications,
      applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
        acc[curr.status.toLowerCase()] = curr._count;
        return acc;
      }, {}),
      jobsByType: jobsByType.reduce((acc, curr) => {
        acc[curr.jobType.toLowerCase()] = curr._count;
        return acc;
      }, {}),
      topSkills,
    };
  }

  // Search jobs by skills (for youth)
  static async searchJobsBySkills(skills, userId = null) {
    if (!Array.isArray(skills) || skills.length === 0) {
      throw new Error('Skills array is required');
    }

    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            companyProfile: {
              select: {
                companyName: true,
                logo: true,
                industry: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      take: 100, // Initial limit
    });

    // Filter and rank jobs by skill match
    const jobsWithMatch = jobs
      .map((job) => {
        const jobSkills = job.requiredSkills ? JSON.parse(job.requiredSkills) : [];
        
        // Calculate match percentage
        const matchingSkills = skills.filter((skill) =>
          jobSkills.includes(skill)
        );
        const matchPercentage = (matchingSkills.length / Math.max(jobSkills.length, 1)) * 100;

        // Identify skill gaps
        const skillGap = jobSkills.filter((skill) => !skills.includes(skill));

        return {
          ...job,
          requiredSkills: jobSkills,
          matchPercentage: Math.round(matchPercentage),
          matchingSkills,
          skillGap,
        };
      })
      .filter((job) => job.matchPercentage > 0) // Only show jobs with some match
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    return jobsWithMatch;
  }

  // Get job categories/types
  static async getJobCategories() {
    const jobTypes = await prisma.job.groupBy({
      by: ['jobType'],
      _count: true,
      where: { isActive: true },
    });

    const locations = await prisma.job.groupBy({
      by: ['location'],
      _count: true,
      where: { isActive: true, location: { not: null } },
      take: 20,
    });

    // Extract popular skills from all jobs
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      select: { requiredSkills: true },
      take: 200,
    });

    const skillFrequency = {};
    jobs.forEach((job) => {
      if (job.requiredSkills) {
        const skills = JSON.parse(job.requiredSkills);
        skills.forEach((skill) => {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });
      }
    });

    const popularSkills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([skill]) => skill);

    return {
      jobTypes: jobTypes.map((type) => ({
        type: type.jobType,
        count: type._count,
      })),
      popularLocations: locations
        .map((loc) => ({
          location: loc.location,
          count: loc._count,
        }))
        .sort((a, b) => b.count - a.count),
      popularSkills,
    };
  }
}