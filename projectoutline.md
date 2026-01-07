1. Project Overview
Objective:
Build a skill-based, AI-powered employment platform that connects Nepali youth with jobs, internships, and personalized learning paths by analyzing skills, matching them with job requirements using cosine similarity, identifying skill gaps, and providing career guidance.

Target Users:

Youth / Job Seekers

Employers / Startups / SMEs

Admin

Unique Selling Proposition (Hackathon-Winning Features):

AI-powered Skill Gap → Learning → Job Loop that continuously improves employability

Career Path Simulator providing step-by-step guidance to reach a target role

Market-Aware Skill Recommendations based on real Nepali job market demand

Degree-Independent Hiring to remove bias and focus purely on skills

AI-driven Career Assistant Chatbot giving personalized career guidance

AI understands related skills using cosine similarity, not just keyword matching

2. High-Level Project Flow (Step-by-Step)
User visits platform

User registers & logs in (Youth / Employer)

Youth creates skill-based profile

AI converts youth skills into numerical vectors

Employer posts job requirements

Job skills are converted into vectors

AI engine uses cosine similarity to match youth skills with job requirements

Match percentage is calculated

Skill gap analysis is generated

Personalized learning recommendations are suggested

Career Path Simulator shows step-by-step skill roadmap

Youth applies for job

Employer reviews ranked candidates based on cosine similarity match score

3. System Architecture
Frontend (Next.js) → Backend API (Express.js) → Database (MongoDB) →
AI Logic Layer (Skill Embeddings, Cosine Similarity Matching, NLP, Recommendations, Career Simulator)

4. Frontend Engineer Responsibilities (Next.js)
4.1 Pages & UI Flow
Public Pages
/ – Landing Page with USP highlighted

/login – Login Page

/register – Register Page

Youth Dashboard
/youth/dashboard

/youth/profile (Skill builder, AI skill analysis)

/youth/jobs

/youth/job/[id]

Match % (Cosine Similarity Score)

Skill gap visualization

Learning suggestions

/youth/learning (Personalized roadmap)

/youth/chatbot (AI career assistant)

/youth/applications

/youth/career-path (Simulator)

Employer Dashboard
/employer/dashboard

/employer/profile

/employer/post-job

/employer/jobs

/employer/job/[id]/candidates

Ranked candidates by cosine similarity score

4.2 Frontend Feature Flow (Youth)
Login/Register

Create/Edit Skill Profile

AI converts skills into vectors

View AI-recommended jobs

See cosine similarity match percentages

View skill gap analysis

View learning recommendations

Use Career Path Simulator

Chat with AI career assistant

Apply for job

4.3 Frontend Feature Flow (Employer)
Login/Register

Create company profile

Post job/internship

View ranked candidates using cosine similarity

Review candidate skill gaps and readiness

5. Backend Engineer Responsibilities (Express.js)
5.1 Backend Modules
Authentication Module

User Management Module

Job Management Module

Skill Matching & AI Engine Module (Cosine Similarity Based)

Learning Recommendation Engine

Career Path Simulator Module

Application Management Module

6. Database Design (MongoDB)
6.1 User Schema
User {
  _id,
  name,
  email,
  password,
  role: 'youth' | 'employer',
  skills: [String],
  experienceLevel,
  location,
  interests,
  createdAt
}
6.2 Job Schema
Job {
  _id,
  employerId,
  title,
  description,
  requiredSkills: [String],
  jobType,
  location,
  createdAt
}
6.3 Application Schema
Application {
  _id,
  userId,
  jobId,
  matchPercentage, // Cosine similarity × 100
  skillGap: [String],
  learningRecommendations: [String],
  status,
  createdAt
}
7. Complete Backend API Routes
7.1 Authentication Routes
POST /api/auth/register

POST /api/auth/login

7.2 User Routes
GET /api/users/me

PUT /api/users/profile

GET /api/users/skills

7.3 Job Routes
POST /api/jobs (Employer)

GET /api/jobs

GET /api/jobs/:id

DELETE /api/jobs/:id

7.4 AI Matching & Recommendation Routes
POST /api/ai/match-job (Uses cosine similarity)

GET /api/ai/recommended-jobs

POST /api/ai/skill-gap

GET /api/ai/learning-path

GET /api/ai/career-path-simulator

7.5 Application Routes
POST /api/applications/apply

GET /api/applications/user

GET /api/applications/job/:jobId

7.6 AI Career Assistant Route
POST /api/ai/chat

8. AI Logic Flow (Cosine Similarity Based)
Extract skills from user profile or resume

Extract required skills from job postings

Convert skills into vector embeddings

Compute cosine similarity between user and job vectors

Convert similarity score into match percentage

Identify missing or weak skills (skill gap)

Generate personalized learning recommendations

Career Path Simulator creates step-by-step roadmap

AI chatbot answers career-related questions

9. Role Distribution (Hackathon Team)
Teammate 1 (Frontend Engineer)
UI/UX implementation

Pages & dashboards

API integration

Visualization of cosine similarity match %

Teammate 2 (Backend & AI Engineer)
API development

Database & schemas

Cosine similarity skill matching logic

Learning engine

Career Path Simulator & chatbot

10. MVP Scope (Hackathon Ready)
Build:
Auth system

Skill profiles & resume input

Job posting

Cosine similarity–based skill match %

Skill gap analysis

Personalized learning recommendations

Career Path Simulator demo

Chatbot demo

Future Scope:
Resume auto-analysis

Skill verification badges

Advanced embedding models

Analytics dashboard for employers

Government/NGO program integration

11. Unique Features Highlight (Judge-Winning Layer)
Skill Gap → Learning → Job Loop

Cosine Similarity–based Skill Matching

Career Path Simulator

Market-Aware Skill Recommendations

AI Career Assistant Chatbot

Degree-Independent Hiring Model

AI understands related skills, not just exact keywords