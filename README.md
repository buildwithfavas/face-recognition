# 🎭 Facial Recognition Web Application

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)

> A real-time facial recognition system built with React, TypeScript, and TensorFlow.js that runs entirely in your browser. Privacy-first with all processing happening locally - no data sent to servers!

## 🎯 Features

### Core Capabilities
- **Real-time Face Detection:** Continuously detect faces from webcam feed
- **Multiple Face Support:** Detect and track multiple faces simultaneously
- **Facial Analysis:**
  - Age estimation
  - Gender classification
  - Emotion recognition (7 emotions: neutral, happy, sad, angry, fearful, disgusted, surprised)
  - Face recognition and matching
- **User Registration:** Add user with names for automatic recognition
- **Image Upload:** Analyze faces in uploaded images (PNG/JPEG) Max 10MB
- **Visual Overlay:** Emotion-based color-coded bounding boxes with labels showing:
  - Name (registered or "Unknown")
  - Age, Gender, Emotion with confidence
  - **Green** for happy, **Red** for angry, **Blue** for sad, and more!
- **Responsive Design:** Works seamlessly on desktop and mobile devices

### Advanced Features
- **User Registration System:**
  - Register users with names
  - Store user descriptors in browser localStorage
  - Automatic recognition when registered users appear
  - Manage database (view/delete registered users)
- **Emotion-Based Color Coding:**
  - Happy → Green (#10b981)
  - Angry → Red (#ef4444)
  - Sad → Blue (#3b82f6)
  - Surprised → Orange (#f59e0b)
  - Neutral → Teal (#14b8a6)
  - Disgusted → Purple (#8b5cf6)
  - Fearful → Indigo (#6366f1)
- **Privacy-First:** All processing happens locally in your browser, no data sent to servers
- **Keyboard Shortcuts:** Quick actions with 'S' key for Start and Stop Webcam

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **State Management:** Redux Toolkit
- **UI Framework:** React Bootstrap 5
- **Face Recognition:** @vladmandic/face-api (TensorFlow.js)
- **Build Tool:** Vite
- **Webcam Access:** react-webcam (MediaDevices.getUserMedia API)

## 📋 Requirements Met

This application fulfills 100% of client requirements:
- ✅ React + TypeScript implementation
- ✅ Start/Stop webcam controls
- ✅ Facial recognition with TensorFlow.js
- ✅ Visual overlay on detected faces
- ✅ Display name, age, gender, and emotions
- ✅ Multiple face detection
- ✅ Responsive desktop and mobile design
- ✅ Redux state management
- ✅ **Bonus:** Image upload functionality
- ✅ **Bonus:** Real-time emotion recognition
- ✅ **Extra:** User registration and persistent storage
- ✅ **Extra:** Emotion-based color coding
- ✅ **Extra:** Registered user name display in overlay

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Modern browser (Chrome, Firefox, Edge, Safari)
- Webcam/camera access

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Production Build
```bash
npm run build       # Build for production
npm run preview     # Preview production build locally
```

## ⌨️ Keyboard Shortcuts

- **S:** Start/Stop webcam streaming

## 📖 Usage Guide

### Starting Face Detection
1. Click **Start Camera** button
2. Grant webcam permission when prompted
3. Overlay detection boxes will appear around detected faces
4. Face attributes (name, age, gender, emotion) display in overlay labels

### Capturing & Analyzing Images
- **Upload Image:** Click **Upload** → Select PNG/JPEG file Max 10MB

## 📂 Project Structure

```
src/
├── app/              # Redux store configuration
├── components/       # React components (Navbar, Overlay, Modals, etc.)
│   ├── ErrorBoundary.tsx      # Error handling boundary
│   ├── FaceOverlay.tsx         # Face detection overlay (memoized)
│   ├── WebcamFeed.tsx          # Webcam controls
│   └── ...modals               # Various modal dialogs
├── constants/        # Application-wide constants
│   └── index.ts                # Centralized configuration
├── features/
│   ├── camera/      # Camera state & services
│   │   ├── CameraService.ts    # Camera control logic
│   │   └── CameraSlice.ts      # Redux state management
│   └── faces/       # Face detection & recognition
│       ├── FaceService.ts      # Face detection engine
│       ├── Recognition.ts      # User matching & storage
│       └── types.ts            # TypeScript interfaces
├── hooks/            # Custom React hooks
│   ├── useFaceDetection.ts    # Face detection hook
│   └── useLocalStorage.ts     # localStorage hook
├── pages/           # Main application pages
│   └── Home.tsx                # Main detection interface
├── utils/           # Utility functions
│   ├── validators.ts           # Input validation
│   └── modelLoader.ts          # ML model loading
└── __tests__/       # Test suites
```

### Architecture Highlights

- **Error Boundary**: Catches React errors gracefully
- **Custom Hooks**: Reusable stateful logic
- **Centralized Validation**: Consistent input validation
- **TypeScript**: Full type safety throughout
- **Performance Optimized**: React.memo, useCallback, useMemo
- **Comprehensive Testing**: Unit tests with Vitest

## 🧪 Testing

### Running Tests
```bash
npm run test        # Run unit tests with Vitest
npm run test:ui     # Run tests with UI
npm run coverage    # Generate coverage report
npm run lint        # Code quality checks
npm run type-check  # TypeScript type checking
```

### Test Coverage

- **Recognition Module**: CRUD operations, age calculation, user matching
- **Validators**: Image validation, user input validation
- **Redux Slices**: Camera and face detection state management
- **Target Coverage**: 80%+

### Test Structure
```
src/
├── features/faces/__tests__/
│   └── Recognition.test.ts
├── utils/__tests__/
│   └── validators.test.ts
└── hooks/__tests__/
    ├── useFaceDetection.test.ts
    └── useLocalStorage.test.ts
```