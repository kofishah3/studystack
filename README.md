![StudyStack Banner](public/logos/studystack-wordlogo.png)

# StudyStack

StudyStack is a community-driven learning platform designed for students to collaborate through interactive Q&A and linked tutorials. It serves as a central hub where knowledge is shared, questions are answered, and learning materials are organized into easy-to-follow tutorials.

## Features

- **Interactive Q&A**: Ask questions, provide answers, and engage with the student community.
- **Linked Tutorials**: Create and explore tutorials that are directly linked to relevant questions and discussions.
- **Real-time Updates**: Stay informed with live notifications for new answers and comments.
- **Academic Profiles**: Build your credibility within the community through scores and engagement metrics.
- **Media Support**: Seamlessly upload and view documents and videos within tutorials and answers.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend**: React 19, Tailwind CSS 4
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/))
- **Real-time**: Socket.io
- **Storage**: Supabase Storage
- **Authentication**: JWT-based secure authentication

## Project Structure

```text
studystack/
├── src/
│   ├── app/           # App router pages and API handlers
│   ├── components/    # Shared UI components (inputs, cards, navigation)
│   ├── lib/           # Database queries, auth logic, and shared utilities
│   ├── types/         # TypeScript definitions
│   └── utils/         # Helper functions
├── public/            # Static assets and logos
├── supabase/          # Database migrations and seed data
├── server.ts          # Custom server for Socket.io and Cron jobs
└── next.config.ts     # Next.js configuration
```

## Developed By

- **Limpag, Max Lennon**
- **Sandro, John Carlo**
- **Malig, Selena Therese**
- **Recilla, Isabella Nicole**
- **Bautista, Ishah Nicholei**

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- PostgreSQL (or a Supabase project)

### Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file based on `.env.example` and fill in your Supabase and JWT credentials.
4. **Initialize Database**:
   ```bash
   npm run init-db
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [https://studystack-jet.vercel.app](https://studystack-jet.vercel.app) to view the application.
