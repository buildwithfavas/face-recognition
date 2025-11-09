# Face Registration & Recognition System

## Overview
This application now includes a complete **face registration and recognition system** that allows you to store people's information and automatically recognize them when they appear on camera.

## How It Works

### 1. **Face Detection**
- The system uses TensorFlow.js and face-api.js to detect faces in real-time
- Each detected face is analyzed for:
  - **Facial features** (128-dimensional descriptor vector)
  - **Age** (estimated)
  - **Gender** (male/female)
  - **Emotion** (happy, sad, angry, neutral, etc.)

### 2. **Face Registration**
When you see an "Unknown" person:
1. Click the **"Register"** button next to their detection
2. Enter their name in the modal dialog
3. The system saves their facial descriptor to browser localStorage
4. Next time this person appears, they'll be recognized automatically

### 3. **Face Recognition**
- The system compares detected faces against all registered faces
- Uses **Euclidean distance** matching algorithm
- If a match is found (distance < 0.45 threshold), displays the person's name
- Name is highlighted in **blue** when recognized

## Features

### Storage System
- **Technology**: Browser localStorage
- **Data Stored**: 
  - Person's name
  - 128-dimensional facial descriptor (mathematical representation of face)
- **Persistence**: Data persists across browser sessions
- **Limitations**: 
  - ~5-10MB storage limit
  - Data is device/browser-specific
  - Clearing browser data removes all registrations

### Manage Registered Faces
1. Click **"Manage Faces"** button in the Detected Faces panel
2. View all registered people
3. Delete individual faces or clear all registrations

## Usage Instructions

### Register a New Person
1. Start the webcam
2. Wait for face detection (blue box appears)
3. If person shows as "Unknown", click **"Register"** button
4. Enter their name
5. Click "Register Face"
6. Done! They'll be recognized next time

### View Registered Faces
1. Click **"Manage Faces"** button
2. See all registered people with their facial descriptors
3. Delete any registration if needed

### Recognition in Action
- Registered people appear with their **name in blue**
- Unknown faces show as "Unknown" with a Register button
- Multiple faces can be recognized simultaneously

## Technical Details

### Face Matching Algorithm
```typescript
// Euclidean distance calculation
distance = sqrt(Σ(descriptor1[i] - descriptor2[i])²)

// If distance < 0.45 threshold → Match found
// Lower distance = better match
```

### Data Structure
```typescript
{
  name: string;           // Person's name
  descriptor: number[];   // 128 float values representing facial features
}
```

### Files Involved
- `src/features/faces/Recognition.ts` - Face matching logic
- `src/components/RegisterFaceModal.tsx` - Registration UI
- `src/components/ManageFacesModal.tsx` - Management UI
- `src/pages/Home.tsx` - Integration
- `src/features/faces/FaceService.ts` - Detection service

## Privacy & Security

### Privacy Notes
- ✅ All data stored **locally** in your browser
- ✅ No data sent to external servers
- ✅ You control all registrations
- ✅ No actual photos stored (only mathematical descriptors)

### Data Management
- Delete individual faces: Use "Manage Faces" dialog
- Clear all data: Click "Clear All" in management dialog
- Export/backup: Currently not implemented (future feature)

## Troubleshooting

### "Cannot register face: No facial features detected"
- Ensure good lighting conditions
- Face should be clearly visible and front-facing
- Try moving closer to the camera
- Wait for detection to stabilize

### Face not being recognized
- Recognition threshold is 0.45 (conservative)
- Try re-registering with better lighting
- Ensure face is similar to registration conditions
- Check if person is already registered with different name

### Storage limit reached
- Browser localStorage typically allows 5-10MB
- Each face takes ~500 bytes
- Can store approximately 10,000+ faces
- If limit reached, delete old registrations

## Future Enhancements
- ✨ Export/Import face database
- ✨ Sync across devices (cloud storage)
- ✨ Adjustable matching threshold
- ✨ Face photo thumbnails
- ✨ Registration history/timestamps
- ✨ Bulk operations

## Tech Stack
- **Framework**: React + TypeScript
- **State Management**: Redux Toolkit
- **Face Detection**: @vladmandic/face-api.js
- **ML Backend**: TensorFlow.js
- **Storage**: Browser localStorage
- **UI**: React Bootstrap

---

**Note**: This system works entirely in your browser. No facial data leaves your device!
