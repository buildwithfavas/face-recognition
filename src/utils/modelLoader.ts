import * as faceapi from '@vladmandic/face-api';

export type LoadModelsOptions = {
  baseUrl?: string;
  useTiny?: boolean;
  onProgress?: (status: string) => void;
};

function status(cb: ((s: string) => void) | undefined, s: string) {
  if (cb) cb(s);
}

async function loadAll(base: string, onProgress?: (s: string) => void): Promise<void> {
  // Always load both detector models to ensure they're available
  if (!faceapi.nets.tinyFaceDetector.isLoaded) {
    status(onProgress, 'loading tiny face detector');
    await faceapi.nets.tinyFaceDetector.loadFromUri(base);
  }
  if (!faceapi.nets.ssdMobilenetv1.isLoaded) {
    status(onProgress, 'loading ssd mobilenetv1');
    await faceapi.nets.ssdMobilenetv1.loadFromUri(base);
  }
  if (!faceapi.nets.faceLandmark68Net.isLoaded) {
    status(onProgress, 'loading face landmark 68');
    await faceapi.nets.faceLandmark68Net.loadFromUri(base);
  }
  if (!faceapi.nets.faceRecognitionNet.isLoaded) {
    status(onProgress, 'loading face recognition');
    await faceapi.nets.faceRecognitionNet.loadFromUri(base);
  }
  if (!faceapi.nets.ageGenderNet.isLoaded) {
    status(onProgress, 'loading age gender');
    await faceapi.nets.ageGenderNet.loadFromUri(base);
  }
  if (!faceapi.nets.faceExpressionNet.isLoaded) {
    status(onProgress, 'loading face expression');
    await faceapi.nets.faceExpressionNet.loadFromUri(base);
  }
  status(onProgress, 'models loaded');
}

export async function loadModels(opts?: LoadModelsOptions): Promise<void> {
  const onProgress = opts?.onProgress;
  const localBase = opts?.baseUrl ?? '/models';
  try {
    await loadAll(localBase, onProgress);
    return;
  } catch (localError) {
    console.warn('Local model loading failed, trying CDN fallback:', localError);
    try {
      const cdnBase = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
      await loadAll(cdnBase, onProgress);
    } catch (cdnError) {
      console.error('Both model loading attempts failed:', cdnError);
      throw new Error('Failed to load face detection models from both local and CDN sources. Please check your internet connection.');
    }
  }
}
