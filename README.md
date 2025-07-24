# AI Productivity Suite - Frontend

A modern React-based frontend application for the AI Productivity Suite designed specifically for students. This application provides an intuitive interface for task management, habit tracking, note-taking with AI summarization, PDF Q&A, and Pomodoro timer functionality.

## 🚀 Features

- **🎯 Dashboard** - Comprehensive overview of tasks, habits, and productivity metrics
- **✅ Todo Management** - Create, organize, and track tasks with filtering and tagging
- **🎯 Habit Tracker** - Monitor daily habits with visual progress tracking
- **📝 Smart Notes** - AI-powered note summarization with multiple styles
- **📚 PDF Q&A** - Upload PDFs and ask intelligent questions using RAG technology
- **📄 Document Summarizer** - AI-powered PDF summarization for exam preparation with multiple summary types
- **⏱️ Pomodoro Timer** - Customizable focus sessions with break management
- **🔐 Authentication** - Secure user login and registration
- **📱 Responsive Design** - Mobile-friendly interface with Tailwind CSS
- **🎨 Modern UI** - Clean, intuitive design with Lucide React icons

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.8.1
- **State Management**: React Query 3.39.3
- **Forms**: React Hook Form 7.43.5
- **Styling**: Tailwind CSS 3.2.7
- **Icons**: Lucide React 0.331.0
- **Charts**: Recharts 2.5.0
- **Animations**: Framer Motion 10.0.1
- **HTTP Client**: Axios 1.3.4
- **Notifications**: React Hot Toast 2.4.0
- **PDF Handling**: React PDF 6.2.2
- **File Upload**: React Dropzone 14.2.3
- **Date Utilities**: date-fns 2.29.3

## 📋 Prerequisites

- Node.js 16.0 or higher
- npm or yarn package manager
- Backend API server running on `http://localhost:5000`

## 🔧 Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_APP_NAME=AI Study Suite
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm start
# or
yarn start
```
Application will start on `http://localhost:3000`

### Using the batch file
```bash
../start_frontend.bat
```

### Build for Production
```bash
npm run build
# or
yarn build
```

### Run Tests
```bash
npm test
# or
yarn test
```

## 🗂️ Project Structure

```
frontend/
├── public/
│   ├── index.html           # Main HTML template
│   ├── manifest.json        # PWA manifest
│   ├── favicon.ico          # App icon
│   └── robots.txt           # SEO configuration
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.js       # Navigation sidebar
│   │   ├── Header.js        # App header
│   │   ├── Layout.js        # Main layout wrapper
│   │   └── ...              # Other shared components
│   ├── pages/               # Page components
│   │   ├── Dashboard.js     # Main dashboard
│   │   ├── TodosPage.js     # Task management
│   │   ├── HabitsPage.js    # Habit tracking
│   │   ├── NotesPage.js     # Note management
│   │   ├── PomodoroPage.js  # Pomodoro timer
│   │   ├── PDFQAPage.js     # PDF Q&A interface
│   │   ├── LoginPage.js     # User authentication
│   │   └── RegisterPage.js  # User registration
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js       # Authentication hook
│   │   ├── usePomodoroTimer.js # Timer functionality
│   │   └── ...              # Other custom hooks
│   ├── services/            # API service functions
│   │   ├── api.js           # Axios configuration
│   │   ├── authService.js   # Authentication APIs
│   │   ├── todoService.js   # Todo APIs
│   │   ├── habitService.js  # Habit APIs
│   │   ├── noteService.js   # Note APIs
│   │   ├── pomodoroService.js # Pomodoro APIs
│   │   └── pdfService.js    # PDF Q&A APIs
│   ├── utils/               # Utility functions
│   │   ├── helpers.js       # General helpers
│   │   ├── constants.js     # App constants
│   │   └── validation.js    # Form validation
│   ├── contexts/            # React contexts
│   │   └── AuthContext.js   # Authentication context
│   ├── styles/              # Global styles
│   │   └── index.css        # Tailwind imports and custom styles
│   ├── App.js               # Main App component
│   └── index.js             # React app entry point
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🎨 UI Components & Features

### 📊 Dashboard
- **Quick Stats** - Overview of today's tasks, habits, and productivity
- **Recent Activity** - Latest todos, habit completions, and notes
- **Progress Charts** - Visual representation of productivity trends
- **Quick Actions** - Fast access to common features

### ✅ Todo Management
- **Create & Edit** - Rich task creation with due dates, priorities, and tags
- **Filtering** - Filter by status (all, pending, completed), tags, and due dates
- **Search** - Quick task search functionality
- **Drag & Drop** - Intuitive task reordering (if implemented)

### 🎯 Habit Tracker
- **Daily Tracking** - Mark habits as complete with visual feedback
- **Progress Visualization** - Charts showing habit completion trends
- **Streak Tracking** - Monitor consecutive completion days
- **Custom Habits** - Create personalized habits with different frequencies

### 📝 Smart Notes
- **Rich Text Editor** - Create and edit notes with formatting
- **AI Summarization** - Generate summaries in different styles:
  - Concise (2-3 sentences)
  - Detailed (comprehensive overview)
  - Bullet Points (key points listed)
- **Categorization** - Organize notes by categories and tags
- **Search & Filter** - Find notes quickly by content or metadata

### 📚 PDF Q&A
- **Document Upload** - Drag & drop PDF upload with progress tracking
- **Intelligent Q&A** - Ask questions about uploaded documents
- **Context-Aware Responses** - Get answers with relevant document excerpts
- **Document Management** - View, organize, and delete uploaded PDFs

### ⏱️ Pomodoro Timer
- **Customizable Sessions** - Set work, short break, and long break durations
- **Visual Timer** - Large, easy-to-read countdown with progress bar
- **Session Tracking** - Monitor completed sessions and productivity stats
- **Auto-Start Options** - Automatically transition between work and breaks
- **Notifications** - Desktop and audio notifications for session completion

## 🔐 Authentication

The app uses JWT-based authentication with the following features:
- **Secure Login/Register** - Form validation and error handling
- **Persistent Sessions** - Remember login state across browser sessions
- **Protected Routes** - Automatic redirection for unauthenticated users
- **Token Management** - Automatic token refresh and logout on expiry

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-First Approach** - Optimized for small screens
- **Collapsible Sidebar** - Space-efficient navigation on mobile
- **Touch-Friendly** - Appropriate touch targets and gestures
- **Adaptive Layouts** - Components adjust to different screen sizes

## 🎨 Styling & Theming

### Tailwind CSS Configuration
- **Custom Colors** - Primary color scheme for brand consistency
- **Typography** - Optimized font scales and line heights
- **Spacing** - Consistent spacing system throughout the app
- **Breakpoints** - Mobile, tablet, and desktop responsive breakpoints

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Success**: Green for completed tasks and positive actions
- **Warning**: Yellow/Orange for alerts and cautions
- **Error**: Red for errors and destructive actions
- **Gray Scale**: Various gray tones for text and backgrounds

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_APP_NAME` | Application display name | `AI Study Suite` |

### API Integration

All API calls are centralized in service files with:
- **Axios Interceptors** - Automatic token attachment and error handling
- **React Query** - Caching, background updates, and optimistic updates
- **Error Boundaries** - Graceful error handling and user feedback

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Structure
- **Component Tests** - Test individual component behavior
- **Integration Tests** - Test component interactions
- **API Tests** - Mock API responses and test service functions
- **End-to-End Tests** - Full user workflow testing (if configured)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `build/` directory can be deployed to:
- **Netlify** - Drag & drop deployment
- **Vercel** - Git-based deployment
- **GitHub Pages** - Static site hosting
- **AWS S3** - Cloud storage with CloudFront
- **Any Static Host** - Upload build files to your preferred host

### Environment Setup for Production
1. Set production API URL in environment variables
2. Configure proper CORS settings on backend
3. Set up SSL certificates for HTTPS
4. Configure CDN for optimal performance

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend server is running on correct port
   - Check `REACT_APP_API_URL` environment variable
   - Ensure CORS is properly configured on backend

2. **Authentication Issues**
   - Clear browser localStorage and cookies
   - Check JWT token expiry
   - Verify backend authentication endpoints

3. **Build Failures**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors if using TypeScript
   - Verify all environment variables are set

4. **Performance Issues**
   - Enable React Developer Tools for performance profiling
   - Check for unnecessary re-renders
   - Optimize large lists with virtualization

### Development Tips
- Use React Developer Tools browser extension
- Enable React Query DevTools in development
- Monitor network requests in browser DevTools
- Use console.log strategically for debugging

## 📄 License

This project is part of the AI Productivity Suite for Students.

## 🤝 Contributing

1. Follow React best practices and hooks patterns
2. Use functional components with hooks
3. Implement proper error boundaries
4. Add appropriate loading states and error handling
5. Ensure responsive design for all new components
6. Write tests for new features
7. Update documentation for significant changes

## 🔮 Future Enhancements

- **Dark Mode** - Theme switching capability
- **PWA Features** - Offline functionality and push notifications
- **Real-time Updates** - WebSocket integration for live updates
- **Advanced Analytics** - Detailed productivity insights and reports
- **Collaboration** - Shared todos and study groups
- **Calendar Integration** - Sync with external calendar services
- **Voice Commands** - Voice-activated task creation and timer control
"# summer_internship_frontend" 
