




Keyboard shortcuts:
Space: Capture a snapshot (when webcam is active).
S: Start/Stop webcam streaming.
Shortcuts are disabled while typing inside input fields or text areas.

How to run locally:
npm run dev
How to build for production:
npm run build
Outputs static assets to dist/ 
(see Vite docs: https://vitejs.dev/guide/build.html)
How to preview a production build:
npm run preview

## End-to-end manual test checklist

- **Launch app**
  - Open the app over HTTPS. Confirm Navbar loads and no errors in console.

- **Start/Stop camera**
  - Click Start. Grant webcam permission. Verify live video appears.
  - Click Stop. Verify video area shows "Camera is stopped" placeholder.
  - Use keyboard: press `S` to toggle start/stop.

- **Live detection**
  - With camera running, ensure green boxes appear around faces.
  - Verify multiple faces show multiple boxes and labels.
  - Check the Detections list updates with thumbnails and attributes.

- **Upload image detection**
  - Click Upload and choose a PNG/JPEG. Confirm image displays in the left pane.
  - Verify boxes/labels overlay correctly and Detections list populates.

- **Emotion recognition**
  - Open Settings → Enable Emotion Recognition (if disabled). Save.
  - Confirm top emotion and probability appear on labels and in the Detections list.
  - Toggle it off and verify emotions disappear, boxes remain.

- **Enrollment and recognition**
  - Capture a frame (Capture button or press Space) and enroll a detected face via Enroll dialog.
  - After enrolling, capture again or keep streaming; verify the name appears for the matched face.

- **Settings impact**
  - Change Detection frequency (ms) and confirm CPU usage/refresh rate changes.
  - Switch Model between Tiny and SSD and confirm detection speed/accuracy changes.
  - Adjust Confidence threshold and verify box count changes accordingly.
  - On mobile, change Camera to Front/Back (facingMode) and verify camera switches (device support dependent).

- **Download annotated**
  - Click "Download annotated" and verify a PNG downloads with boxes and labels drawn.

- **Keyboard shortcuts**
  - `Space`: captures snapshot (when webcam active).
  - `S`: start/stop streaming.
  - Verify shortcuts are ignored while typing in inputs/textareas.

- **Privacy & storage**
  - Confirm no network requests for images/descriptors.
  - Verify enrolled faces persist across reloads (localStorage) and can be cleared/exported as documented.