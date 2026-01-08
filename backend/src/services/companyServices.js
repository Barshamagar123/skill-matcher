import prisma from '../config/prisma.js';

export class CompanyService {
  // Create or update company profile
  static async upsertCompanyProfile(userId, data) {
    // Check if user is employer
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user.role !== 'EMPLOYER') {
      throw new Error('Only employers can create company profiles');
    }

    const companyProfile = await prisma.companyProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: data.companyName,
        description: data.description,
        website: data.website,
        industry: data.industry,
        companySize: data.companySize,
        logo: data.logo,
        foundedYear: data.foundedYear,
        address: data.address,
        linkedin: data.linkedin
      },
      update: {
        companyName: data.companyName,
        description: data.description,
        website: data.website,
        industry: data.industry,
        companySize: data.companySize,
        logo: data.logo,
        foundedYear: data.foundedYear,
        address: data.address,
        linkedin: data.linkedin,
        updatedAt: new Date()
      }
    });

    return companyProfile;
  }

  // Get company profile
  static async getCompanyProfile(userId) {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId }
    });

    if (!companyProfile) {
      throw new Error('Company profile not found');
    }

    return companyProfile;
  }

  // Get company by ID (public)
  static async getCompanyById(companyId) {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { id: companyId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!companyProfile) {
      throw new Error('Company not found');
    }

    return companyProfile;
  }

  // Delete company profile
  static async deleteCompanyProfile(userId) {
    await prisma.companyProfile.delete({
      where: { userId }
    });

    return { success: true, message: 'Company profile deleted' };
  }
}