import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import FaceOverlay from '../components/FaceOverlay';
import HelpModal from '../components/HelpModal';
import ManageFacesModal from '../components/ManageFacesModal';
import Navbar from '../components/Navbar';
import SettingsModal from '../components/SettingsModal';
import UploadImage from '../components/UploadImage';
import WebcamFeed from '../components/WebcamFeed';
import { startDetectionLoop, stopDetectionLoop } from '../features/camera/CameraService';
import { selectStreaming, startStream, stopStream } from '../features/camera/CameraSlice';
import { detectFaces } from '../features/faces/FaceService';
import { clearDetections, setDetections } from '../features/faces/FacesSlice';
import { calculateAge } from '../features/faces/Recognition';
import type { FaceResult } from '../features/faces/types';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const detections = useSelector((s: RootState) => s.faces.detections);
  const streaming = useSelector(selectStreaming);

  const videoWrapRef = useRef<HTMLDivElement | null>(null);
  const uploadWrapRef = useRef<HTMLDivElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [fallbackMsg, setFallbackMsg] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const uploadImgRef = useRef<HTMLImageElement | null>(null);
  const captureRef = useRef<(() => void) | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showManageFaces, setShowManageFaces] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
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
        if (streaming) {
          dispatch(stopStream());
          dispatch(clearDetections());
        } else {
          dispatch(startStream());
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, streaming]);

  useEffect(() => {
    if (streaming && videoEl) {
      void startDetectionLoop(
        videoEl,
        dispatch,
        intervalMs,
        useTiny,
        minConfidence,
        true,
        (msg: string) => {
          setFallbackMsg(msg);
        }
      ).catch((e) => {
        setFallbackMsg('Automatic detection unavailable. You can still take snapshots.');
        // eslint-disable-next-line no-console
        console.error(e);
      });
      return () => {
        stopDetectionLoop(dispatch);
      };
    }
    return;
  }, [streaming, videoEl, dispatch, intervalMs, useTiny, minConfidence, forceUpdate]);

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


  const handleFaceRegistered = useCallback(() => {
    // Force re-render to update detections with new names
    setForceUpdate(prev => prev + 1);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar 
        onUploadClick={handleUploadClick} 
        onSettingsClick={() => setShowSettings(true)}
        onHelpClick={() => setShowHelp(true)}
      />
      <Container fluid className="p-0">
        <Row className="g-0" style={{ minHeight: 'calc(100vh - 56px)' }}>
          {/* Left - Webcam Feed */}
          <Col xs={12} lg={8} className="d-flex" style={{ backgroundColor: 'var(--bg-primary)', padding: '12px' }}>
            <div className="w-100" style={{ position: 'relative' }}>
              {fallbackMsg && (
                <Alert variant="warning" className="mb-3">
                  {fallbackMsg}
                </Alert>
              )}
              
              {/* Video Container with Label */}
              <div style={{ position: 'relative' }}>
                {detections.length > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      zIndex: 10,
                      backgroundColor: 'var(--accent-blue)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {detections.length} {detections.length === 1 ? 'Face' : 'Faces'} Detected
                  </div>
                )}
                
                <div 
                  ref={videoWrapRef} 
                  className="position-relative w-100 ratio ratio-16x9"
                  style={{
                    border: '2px solid var(--accent-blue)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  {streaming ? (
                    <>
                      <div className="position-absolute top-0 start-0 w-100 h-100">
                        <WebcamFeed onCapture={handleCapture} mirrored captureRef={captureRef} facingMode={facingMode} embed />
                      </div>
                      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
                        <FaceOverlay videoRef={videoEl} detections={detections} showExpressions={showExpressions} mirrored />
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
                            className="position-absolute top-0 start-0 w-100 h-100 object-fit-contain"
                          />
                          <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
                            <FaceOverlay videoRef={uploadImgRef.current} detections={detections} showExpressions={showExpressions} />
                          </div>
                        </>
                      ) : (
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="2" y1="2" x2="22" y2="22" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Col>
          
          {/* Right - Sidebar */}
          <Col xs={12} lg={4} className="d-flex align-items-stretch" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div 
              className="d-flex flex-column w-100" 
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                borderRadius: '8px',
                padding: '16px',
                margin: '12px',
                alignSelf: 'stretch'
              }}
            >
              {/* Manage Users Button */}
              <button
                className="btn btn-primary w-100 mb-2 mb-lg-3"
                onClick={() => setShowManageFaces(true)}
                style={{ 
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                Manage Users
              </button>

              {/* Control Buttons */}
              <div className="d-flex gap-2 mb-3 mb-lg-4">
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                  onClick={() => dispatch(startStream())}
                  disabled={streaming}
                  style={{ borderRadius: '6px', padding: '8px 10px', fontSize: '12px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Start Camera
                </button>
                <button
                  className="btn d-flex align-items-center justify-content-center gap-2 flex-grow-1"
                  onClick={() => {
                    dispatch(stopStream());
                    dispatch(clearDetections());
                  }}
                  disabled={!streaming}
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '12px'
                  }}
                >
                  {streaming ? (
                    <span 
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="currentColor" />
                    </svg>
                  )}
                  Stop Camera
                </button>
              </div>

              {/* Detected Faces Section */}
              <div className="flex-grow-1" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                <h5 style={{ marginBottom: '12px', fontWeight: '600', fontSize: '15px' }}>Detected Faces</h5>
                {detections.length > 0 ? (
                  <div>
                    {detections.map((d) => (
                      <div 
                        key={d.id}
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '6px',
                          padding: '10px',
                          marginBottom: '10px'
                        }}
                      >
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {d.name || 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Details</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                            {d.dob ? calculateAge(d.dob) : (d.age || 'N/A')}, {d.gender ? d.gender.charAt(0).toUpperCase() + d.gender.slice(1) : 'N/A'}, {showExpressions && d.expressions ? Object.entries(d.expressions).sort((a, b) => b[1] - a[1])[0]?.[0].charAt(0).toUpperCase() + Object.entries(d.expressions).sort((a, b) => b[1] - a[1])[0]?.[0].slice(1) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px', fontSize: '13px' }}>
                    No faces detected yet
                  </div>
                )}
              </div>
              
              {/* Hidden Upload Area */}
              <div ref={uploadWrapRef} style={{ display: 'none' }}>
                <UploadImage onUpload={handleUpload} />
              </div>
            </div>
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
      <ManageFacesModal
        show={showManageFaces}
        onHide={() => setShowManageFaces(false)}
        onFacesChanged={handleFaceRegistered}
      />
      <HelpModal
        show={showHelp}
        onHide={() => setShowHelp(false)}
      />
    </div>
  );
}
