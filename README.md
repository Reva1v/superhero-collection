# 🦸‍♂️ Superhero Collection

A full-stack web application for managing superhero characters with their images, powers, and stories. Built with React, TypeScript, Node.js, Express, PostgreSQL, and Drizzle ORM.

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **CSS Modules** for styling
- **Custom Hooks** for state management

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** as database
- **Multer** for file uploads
- **Zod** for validation

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**
- **PostgreSQL** (v13 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/superhero-collection.git
cd superhero-collection
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

#### Create Databases

```bash
npm run docker:up
```

#### Configure Environment Variables

Create environment files in the `backend` directory:

**`backend/.env`**
```env
DATABASE_URL=postgresql://postgres:admin@localhost:5433/superhero_collection
```

#### Run Database Migrations

```bash
cd backend

# Setup main database
npm run db:migrate

#OR

# Setup database with mock data
npm run mock:db:migrate
```

### 4. Start the Application

#### Option A: Start with Concurrently

```bash
# From root directory
npm run dev
```

#### Option B: Start Both Services Separately

```bash
# Terminal 1 - Start Backend Server
cd backend
npm run dev

# Terminal 2 - Start Frontend Development Server
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 📁 Project Structure

```
superhero-collection/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # Database schema definitions
│   │   │   └── db.ts           # Database connection
│   │   ├── routes/
│   │   │   └── superhero.ts    # API routes
│   │   ├── services/
│   │   │   └── superheroService.ts # Business logic
│   │   ├── middleware/
│   │   │   └── upload.ts       # File upload middleware
│   │   └── index.ts            # Server entry point
│   ├── uploads/                # File storage directory
│   ├── tests/                  # Test files
│   ├── .env                    # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── types/              # TypeScript type definitions
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Backend Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm start           # Start production server

# Database
npm run db:generate # Generate database migrations
npm run db:apply     # Push schema to database
```

### Frontend Scripts

```bash
# Development
npm run dev         # Start development server
npm run build       # Build for production

# Linting & Type Checking
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler check
```

## 🌐 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superhero` | Get all superheroes (with pagination & search) |
| GET | `/api/superhero/:id` | Get superhero by ID |
| POST | `/api/superhero` | Create new superhero |
| PUT | `/api/superhero/:id` | Update superhero |
| DELETE | `/api/superhero/:id` | Delete superhero |
| GET | `/api/superhero/:id/images` | Get superhero images |
| POST | `/api/superhero/:id/images` | Add images to superhero |
| DELETE | `/api/superhero/:id/images/:index` | Delete specific image |
| DELETE | `/api/superhero/:id/images` | Delete all images |

**Thanks for attention!**
