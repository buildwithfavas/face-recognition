# Emotion Color Guide

## Overview
The face detection overlay uses different colors to represent detected emotions, making it easy to identify how each person is feeling at a glance.

## Color Mapping

### 🟢 Happy - Green (#10b981)
- **Color**: Vibrant Green
- **Meaning**: Person is smiling or showing joy
- **Most Common**: Yes, typically the default for neutral/positive expressions

### 🔵 Sad - Blue (#3b82f6)
- **Color**: Bright Blue
- **Meaning**: Person appears sad or melancholic
- **Visual**: Cool blue tone

### 🔴 Angry - Red (#ef4444)
- **Color**: Bright Red
- **Meaning**: Person shows signs of anger or frustration
- **Visual**: High alert color

### 🟠 Surprised - Orange (#f59e0b)
- **Color**: Vibrant Orange
- **Meaning**: Person appears surprised or shocked
- **Visual**: Attention-grabbing warm tone

### 🔷 Neutral - Teal (#14b8a6)
- **Color**: Vibrant Teal/Cyan
- **Meaning**: No strong emotion detected
- **Visual**: Cool, calm, balanced tone

### 🟣 Disgusted - Purple (#8b5cf6)
- **Color**: Violet Purple
- **Meaning**: Person shows disgust or discomfort
- **Visual**: Distinct purple hue

### 🔷 Fearful - Indigo (#6366f1)
- **Color**: Deep Indigo
- **Meaning**: Person appears fearful or anxious
- **Visual**: Deep blue-purple tone

## Implementation Details

### How It Works
1. Face detection runs and analyzes expressions
2. Top emotion is identified (highest confidence score)
3. Corresponding color is applied to:
   - **Bounding box border** (3px thick)
   - **Label background** (name, age, gender, emotion)
4. Updates in real-time as emotions change

### Label Format
```
[Name] · age [Age] · [Gender] · [Emotion] [Confidence%]
```

Example:
```
John · age 32 · male · happy 95%
```

### Visual Hierarchy
- **Name** - Always shown first (registered name or "Unknown")
- **Age** - Estimated age in years
- **Gender** - Male/Female classification
- **Emotion** - Top emotion with confidence percentage

## Use Cases

### Security & Monitoring
- **Red (Angry)**: Alert personnel to potential issues
- **Blue (Sad)**: Identify people who may need assistance
- **Green (Happy)**: Monitor customer satisfaction

### Retail & Customer Service
- **Green (Happy)**: Satisfied customers
- **Neutral (Teal)**: Browsing customers
- **Angry/Sad**: Customers needing help

### Event Photography
- **Green (Happy)**: Best moments to capture
- **Surprised (Orange)**: Interesting reactions
- **Various colors**: Emotional story of the event

### Educational Settings
- **Green (Happy)**: Engaged students
- **Neutral (Teal)**: Listening students
- **Sad/Fearful**: Students needing support

## Customization

### Changing Colors
To customize emotion colors, edit `src/components/FaceOverlay.tsx`:

```typescript
const colorMap: Record<string, string> = {
  happy: '#10b981',      // Change these hex codes
  sad: '#3b82f6',
  angry: '#ef4444',
  surprised: '#f59e0b',
  neutral: '#14b8a6',    // Change these hex codes
  disgusted: '#8b5cf6',
  fearful: '#6366f1',
};
```

### Adjusting Border Thickness
Find this line in `FaceOverlay.tsx`:
```typescript
ctx.lineWidth = 3;  // Change this value (1-10 recommended)
```

### Font Size
Find this line:
```typescript
ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
```

## Accessibility

### Color Blind Friendly
The current color palette is designed to be distinguishable for most forms of color blindness:
- **Happy (Green)** vs **Angry (Red)**: Most common distinction
- **Surprised (Orange)**: Warm tone
- **Sad (Blue)** vs **Fearful (Indigo)**: Cool tones
- **Disgusted (Purple)**: Unique hue

### High Contrast
- All colors are bright and saturated
- White text on colored backgrounds ensures readability
- 3px border width for clear visibility

### Alternative Indicators
Consider adding:
- Text-based emotion labels (already implemented)
- Icons for emotions (future enhancement)
- Pattern fills (future enhancement)

## Technical Notes

### Performance
- Color calculation is O(1) lookup
- No performance impact on detection speed
- Colors update in real-time with emotion changes

### Browser Compatibility
- Uses standard Canvas 2D API
- Supported in all modern browsers
- Hex colors universally supported

### Fallback
If no emotion is detected:
- Default color: Blue (#3b82f6)
- Label still shows name, age, gender
- Emotion field omitted from label

## Examples

### Happy Person (Green)
```
Sarah · age 28 · female · happy 92%
[Green bounding box and label]
```

### Angry Person (Red)
```
Mike · age 35 · male · angry 87%
[Red bounding box and label]
```

### Neutral Person (Teal)
```
Unknown · age 24 · female · neutral 76%
[Teal bounding box and label]
```

### Multiple People
Different colors for each person based on their individual emotions:
- Person 1: Green (happy)
- Person 2: Orange (surprised)
- Person 3: Teal (neutral)

---

**Note**: Emotion detection is estimated using machine learning and may not always be 100% accurate. Lighting, angle, and facial features can affect detection quality.
