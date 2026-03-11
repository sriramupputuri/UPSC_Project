# UPSC Prep Frontend - React Application

A modern, LeetCode-style frontend for UPSC preparation with authentication, problem browsing, daily challenges, mock tests, and more.

## 🚀 Features

- **Authentication**: Login and Register with email/password
- **Home Page**: Dashboard with user stats and navigation
- **Problems Browser**: Filter and browse UPSC questions by subject, difficulty, year, and paper
- **Daily Problem**: Solve today's question and maintain your streak
- **Mock Tests**: Timed practice tests with question navigation
- **Contests**: View and participate in competitive contests
- **Leaderboard**: See top performers and your rank
- **Discussions**: Community forum for asking questions and sharing insights

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8000`

## 🛠️ Setup Instructions

### 1. Install Dependencies

```powershell
cd C:\Users\exam197\projects\upsc-prep-leetcode\frontend
npm install
```

### 2. Start Development Server

```powershell
npm run dev
```

The frontend will start at `http://localhost:3000`

### 3. Build for Production

```powershell
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── ProblemsPage.jsx
│   │   ├── DailyProblemPage.jsx
│   │   ├── ContestsPage.jsx
│   │   ├── MockTestPage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   └── DiscussionsPage.jsx
│   ├── components/         # Reusable components
│   │   └── Navbar.jsx
│   ├── utils/             # Utilities and API services
│   │   ├── api.js         # API calls
│   │   └── AuthContext.jsx # Authentication context
│   ├── App.jsx            # Main app with routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

## 🎨 Pages Overview

### Home Page (`/`)
- Welcome section with platform overview
- User progress stats (if logged in)
- Feature cards linking to all pages
- Call-to-action for registration

### Login Page (`/login`)
- Toggle between login and register
- Email/password authentication
- JWT token storage
- Redirect to home after login

### Problems Page (`/problems`)
- Filter by subject, paper, difficulty, and year
- List view with question details
- Click to view full question
- Shows solved status

### Daily Problem Page (`/daily`)
- Today's challenge question
- Streak counter with fire icon
- Text area for answer submission
- Word count tracker
- Protected route (requires login)

### Mock Test Page (`/mock-tests`)
- Generate custom mock tests
- 60-minute timer countdown
- Question navigation grid
- Answer tracking
- Submit all answers at once
- Protected route (requires login)

### Contests Page (`/contests`)
- List of upcoming contests
- Contest details (duration, participants, questions)
- Difficulty badges
- Start time information

### Leaderboard Page (`/leaderboard`)
- Top users ranking table
- User stats (problems solved, streak, score)
- Highlight current user
- Overall statistics

### Discussions Page (`/discussions`)
- Browse community discussions
- Create new discussion threads
- View replies count
- Link discussions to questions

## 🔐 Authentication Flow

1. User registers with username, email, password, full name
2. User logs in with username and password
3. Backend returns JWT access token
4. Token stored in localStorage
5. Token included in all API requests via axios interceptor
6. Protected routes check authentication status
7. Logout clears token from localStorage

## 🌐 API Integration

All API calls go through `src/utils/api.js`:

- `authAPI` - Login, register, get current user
- `questionsAPI` - Get questions, filters, daily problem
- `submissionsAPI` - Submit answers, get history
- `userAPI` - User stats, leaderboard
- `badgesAPI` - Get badges, user badges
- `discussionsAPI` - Forum operations
- `mockTestsAPI` - Generate tests

Base URL: `http://localhost:8000`

## 🎯 Protected Routes

These routes require authentication:
- `/daily` - Daily Problem Page
- `/mock-tests` - Mock Test Page

Unauthenticated users are redirected to `/login`

## 🎨 Styling

- Dark theme with custom colors
- LeetCode-inspired design
- Responsive grid layouts
- Difficulty badges (Easy, Medium, Hard)
- Hover effects and transitions
- Mobile-friendly (responsive design)

## 🔧 Configuration

Edit `vite.config.js` to change:
- Dev server port (default: 3000)
- API proxy settings
- Build output directory

## 📦 Dependencies

### Production
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `axios` - HTTP client
- `lucide-react` - Icon library

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite

## 🚀 Deployment

### Option 1: Vercel
```powershell
npm run build
# Deploy the dist/ folder to Vercel
```

### Option 2: Netlify
```powershell
npm run build
# Deploy the dist/ folder to Netlify
```

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution**: Ensure backend is running on `http://localhost:8000`

### Issue: "401 Unauthorized"
**Solution**: Login again - your token may have expired

### Issue: "Questions not loading"
**Solution**: Check backend database is seeded with questions

### Issue: "Port 3000 already in use"
**Solution**: Change port in `vite.config.js` or kill existing process

## 📝 Adding Your Questions

To add your full UPSC question dataset:

1. Update `backend/seed_data.py` with your questions
2. Delete `backend/upsc_prep.db`
3. Run `python backend/seed_data.py`
4. Restart backend server
5. Refresh frontend to see new questions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for your UPSC preparation!

## 🙏 Credits

Built with ❤️ for UPSC aspirants
Inspired by LeetCode's user experience
