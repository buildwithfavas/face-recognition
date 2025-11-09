import { useCallback, useRef, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import Navbar from '../components/Navbar';
import SettingsModal from '../components/SettingsModal';
import WebcamFeed from '../components/WebcamFeed';
import UploadImage from '../components/UploadImage';
import FaceOverlay from '../components/FaceOverlay';
import { detectFaces } from '../features/faces/FaceService';
import { setDetections } from '../features/faces/FacesSlice';
import type { FaceResult } from '../features/faces/types';
import { startDetectionLoop, stopDetectionLoop, isMobileEnvironment } from '../features/camera/CameraService';
import { selectStreaming, startStream, stopStream } from '../features/camera/CameraSlice';
import DetectionsList from '../components/DetectionsList';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const detections = useSelector((s: RootState) => s.faces.detections);
  const streaming = useSelector(selectStreaming);

  const videoWrapRef = useRef<HTMLDivElement | null>(null);
  const uploadWrapRef = useRef<HTMLDivElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [fallbackMsg, setFallbackMsg] = useState<string | null>(null);
  const [snapshotOnly, setSnapshotOnly] = useState<boolean>(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const uploadImgRef = useRef<HTMLImageElement | null>(null);
  const captureRef = useRef<(() => void) | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExpressions, setShowExpressions] = useState<boolean>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('app.settings.showExpressions') : null;
      return raw ? JSON.parse(raw) : true;
    } catch {
      return true;
    }
  });
  const [intervalMs, setIntervalMs] = useState<number>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('app.settings.intervalMs') : null;
      const v = raw ? parseInt(JSON.parse(raw)) : 250;
      return Number.isFinite(v) ? v : 250;
    } catch {
      return 250;
    }
  });
  const [useTiny, setUseTiny] = useState<boolean>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('app.settings.useTiny') : null;
      return raw ? JSON.parse(raw) : false;
    } catch {
      return false;
    }
  });
  const [minConfidence, setMinConfidence] = useState<number>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('app.settings.minConfidence') : null;
      const v = raw ? parseFloat(JSON.parse(raw)) : 0.5;
      return Number.isFinite(v) ? v : 0.5;
    } catch {
      return 0.5;
    }
  });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('app.settings.facingMode') : null;
      const v = raw ? (JSON.parse(raw) as 'user' | 'environment') : 'user';
      return v === 'environment' ? 'environment' : 'user';
    } catch {
      return 'user';
    }
  });

  useEffect(() => {
    const findVideo = () => {
      const el = videoWrapRef.current?.querySelector('video') as HTMLVideoElement | null;
      setVideoEl(el ?? null);
    };
    findVideo();
    const id = window.setInterval(findVideo, 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null): boolean => {
      const t = el as HTMLElement | null;
      if (!t) return false;
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || t.isContentEditable) return true;
      return false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        captureRef.current?.();
      } else if (e.key === 's' || e.key === 'S') {
        if (streaming) dispatch(stopStream());
        else dispatch(startStream());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, streaming]);

  useEffect(() => {
    if (streaming && videoEl) {
      const isMobile = isMobileEnvironment();
      void startDetectionLoop(
        videoEl,
        dispatch,
        intervalMs,
        useTiny,
        minConfidence,
        true,
        (msg: string) => {
          setFallbackMsg(msg);
          setSnapshotOnly(true);
        }
      ).catch((e) => {
        setFallbackMsg('Automatic detection unavailable. You can still take snapshots.');
        setSnapshotOnly(true);
        // eslint-disable-next-line no-console
        console.error(e);
      });
      return () => {
        stopDetectionLoop(dispatch);
      };
    }
    return;
  }, [streaming, videoEl, dispatch, intervalMs, useTiny, minConfidence]);

  const runDetectionOnDataUrl = useCallback(async (dataUrl: string) => {
    const img = new Image();
    img.src = dataUrl;
    await new Promise((res, rej) => {
      img.onload = () => res(null);
      img.onerror = rej;
    });
    const results: FaceResult[] = await detectFaces(img);
    dispatch(setDetections(results));
  }, [dispatch]);

  const handleCapture = useCallback((dataUrl: string) => {
    void runDetectionOnDataUrl(dataUrl);
  }, [runDetectionOnDataUrl]);

  const handleUpload = useCallback((dataUrl: string) => {
    setUploadUrl(dataUrl);
    void runDetectionOnDataUrl(dataUrl);
  }, [runDetectionOnDataUrl]);

  const handleUploadClick = useCallback(() => {
    // Try to focus/trigger the file input inside the upload section
    const input = uploadWrapRef.current?.querySelector('input[type="file"]') as HTMLInputElement | null;
    input?.click();
    uploadWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const activeSourceEl = streaming ? (videoEl as HTMLVideoElement | HTMLImageElement | null) : (uploadImgRef.current as HTMLVideoElement | HTMLImageElement | null);

  const handleDownloadAnnotated = useCallback(() => {
    const container = videoWrapRef.current;
    const src = activeSourceEl;
    if (!container || !src) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;

    const isImg = typeof HTMLImageElement !== 'undefined' && src instanceof HTMLImageElement;
    const vw = isImg ? (src as HTMLImageElement).naturalWidth || w : (src as HTMLVideoElement | null)?.videoWidth || w;
    const vh = isImg ? (src as HTMLImageElement).naturalHeight || h : (src as HTMLVideoElement | null)?.videoHeight || h;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      ctx.drawImage(src as CanvasImageSource, 0, 0, w, h);

      const scaleX = w / (vw || w);
      const scaleY = h / (vh || h);
      ctx.lineWidth = 2;
      ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.textBaseline = 'top';
      detections.forEach((d) => {
        const x = Math.round(d.box.x * scaleX);
        const y = Math.round(d.box.y * scaleY);
        const bw = Math.round(d.box.width * scaleX);
        const bh = Math.round(d.box.height * scaleY);
        ctx.strokeStyle = 'lime';
        ctx.strokeRect(x, y, bw, bh);
        const topExpr = d.expressions ? Object.entries(d.expressions).sort((a, b) => b[1] - a[1])[0] : undefined;
        const exprText = topExpr ? `${topExpr[0]} ${(topExpr[1] * 100).toFixed(0)}%` : undefined;
        const parts: string[] = [];
        if (d.name) parts.push(d.name);
        if (typeof d.age === 'number') parts.push(`age ${d.age}`);
        if (d.gender) parts.push(d.gender);
        if (exprText) parts.push(exprText);
        const label = parts.join(' · ');
        if (label) {
          const padding = 4;
          const metrics = ctx.measureText(label);
          const textW = Math.ceil(metrics.width) + padding * 2;
          const textH = 16 + padding * 2;
          const bx = x;
          const by = Math.max(0, y - textH - 2);
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(bx, by, textW, textH);
          ctx.fillStyle = '#fff';
          ctx.fillText(label, bx + padding, by + padding);
        }
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'annotated.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to create annotated image', e);
    }
  }, [activeSourceEl, detections]);

  return (
    <>
      <Navbar onUploadClick={handleUploadClick} onSettingsClick={() => setShowSettings(true)} />
      <Container className="pb-4">
        <Row className="g-4">
          <Col xs={12} lg={8}>
            <Card>
              <Card.Header>Camera</Card.Header>
              <Card.Body>
                {fallbackMsg && (
                  <Alert variant="warning" className="mb-3">
                    {fallbackMsg}
                  </Alert>
                )}
                <div ref={videoWrapRef} className="position-relative w-100" style={{ aspectRatio: '16/9' }}>
                  {streaming ? (
                    <>
                      <div className="position-absolute top-0 start-0 w-100 h-100">
                        <WebcamFeed onCapture={handleCapture} mirrored captureRef={captureRef} facingMode={facingMode} />
                      </div>
                      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
                        <FaceOverlay videoRef={videoEl} detections={detections} showExpressions={showExpressions} />
                      </div>
                    </>
                  ) : (
                    <>
                      {uploadUrl ? (
                        <>
                          <img
                            ref={uploadImgRef as any}
                            src={uploadUrl}
                            alt="Uploaded"
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{ objectFit: 'contain' }}
                          />
                          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
                            <FaceOverlay videoRef={uploadImgRef.current} detections={detections} showExpressions={showExpressions} />
                          </div>
                        </>
                      ) : (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light border">
                          <span className="text-muted">Upload an image to analyze</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {snapshotOnly && (
                  <div className="mt-2 text-muted small">Detection disabled. Use Capture to analyze snapshots.</div>
                )}
                <div className="mt-3 d-flex justify-content-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleDownloadAnnotated}
                    disabled={!activeSourceEl || detections.length === 0}
                  >
                    Download annotated
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card>
              <Card.Header>Upload Image</Card.Header>
              <Card.Body>
                <div ref={uploadWrapRef}>
                  <UploadImage onUpload={handleUpload} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-1">
          <Col xs={12}>
            <Card>
              <Card.Header>Detections</Card.Header>
              <Card.Body>
                <DetectionsList sourceRef={activeSourceEl} detections={detections} showExpressions={showExpressions} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <SettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
        showExpressions={showExpressions}
        onChangeShowExpressions={setShowExpressions}
        intervalMs={intervalMs}
        onChangeInterval={setIntervalMs}
        useTiny={useTiny}
        onChangeUseTiny={setUseTiny}
        minConfidence={minConfidence}
        onChangeMinConfidence={setMinConfidence}
        facingMode={facingMode}
        onChangeFacingMode={setFacingMode}
      />
    </>
  );
}
