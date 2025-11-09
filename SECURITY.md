# Security Policy

- **Webcam permissions**
  - The app requests access to the camera via `getUserMedia` only when you start the stream.
  - Permission prompts are handled by the browser; access is not retained unless you allow it.

- **Data locality**
  - Face snapshots, detection results, and descriptors are processed entirely in the browser using WebAssembly/WebGL.
  - No images or descriptors are sent to any server by default.

- **Storage**
  - Known faces (name + descriptor) are stored in `localStorage` on the same device and browser profile.
  - You can export/import this data manually for portability. Nothing is auto-synced.

- **Build integrity**
  - Use HTTPS for production deployments to ensure secure camera access and model loading.
  - Models can be loaded from `/public/models` or a reputable CDN; prefer pinning versions.

- **Disabling/limiting access**
  - Stop the camera using the Stop button in the UI or close the tab.
  - Revoke site camera permissions in browser settings (Site Settings → Camera).
  - Remove locally stored faces via browser storage tools or the app’s export/clear functions.

- **Reporting a vulnerability**
  - Please open a private issue or contact the maintainers. Provide reproduction steps, browser version, and logs if possible.
