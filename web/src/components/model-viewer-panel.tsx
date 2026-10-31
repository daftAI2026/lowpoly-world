/**
 * [INPUT]: 依赖 Dataset GLB/预览 URL、@google/model-viewer 和本地双语文案。
 * [OUTPUT]: 导出单资产 3D 舞台，提供旋转、缩放、复位、自动旋转和全屏。
 * [POS]: 详情页唯一模型查看器；失败时保留同一资产的预览图或诚实空态。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import type { ModelViewerElement } from '@google/model-viewer';
import { Maximize2, RotateCcw, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type ModelViewerPanelProps = {
  modelUrl: string | null;
  previewUrl: string | null;
  assetName: string;
};

type ViewerStatus = 'loading' | 'ready' | 'error';

export function ModelViewerPanel({ modelUrl, previewUrl, assetName }: ModelViewerPanelProps) {
  const { t } = useTranslation();
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement>(null);
  const [status, setStatus] = useState<ViewerStatus>('loading');
  const [autoRotate, setAutoRotate] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [fullscreenFailed, setFullscreenFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    setFullscreenSupported(typeof stage?.requestFullscreen === 'function');
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === stage);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (!modelUrl) {
      setStatus('error');
      return;
    }

    const viewer = viewerRef.current;
    if (!viewer) return;
    let active = true;
    setStatus('loading');
    const onLoad = () => {
      if (active) setStatus('ready');
    };
    const onError = () => {
      if (active) setStatus('error');
    };
    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('error', onError);

    void import('@google/model-viewer').then(() => {
      if (!active) return;
      if (viewer.loaded) setStatus('ready');
    }).catch(() => {
      if (active) setStatus('error');
    });

    return () => {
      active = false;
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('error', onError);
    };
  }, [modelUrl]);

  function resetView() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = 'auto auto auto';
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = 'auto';
    viewer.resetTurntableRotation(0);
    viewer.jumpCameraToGoal();
  }

  async function toggleFullscreen() {
    const stage = stageRef.current;
    if (!stage) return;
    setFullscreenFailed(false);
    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else {
        await stage.requestFullscreen();
      }
    } catch {
      setFullscreenFailed(true);
    }
  }

  return (
    <section className="viewer-panel" aria-label={t('asset.viewerLabel')}>
      <div className="viewer-stage" ref={stageRef}>
        {previewUrl && !previewFailed && status !== 'ready' && (
          <img
            className="viewer-poster"
            src={previewUrl}
            alt={assetName}
            onError={() => setPreviewFailed(true)}
          />
        )}
        {modelUrl && (
          <model-viewer
            ref={viewerRef}
            className={status === 'error' ? 'model-viewer model-viewer-hidden' : 'model-viewer'}
            src={modelUrl}
            alt={assetName}
            poster={previewUrl ?? undefined}
            loading="lazy"
            reveal="auto"
            camera-controls={true}
            auto-rotate={autoRotate}
            auto-rotate-delay="1000"
            rotation-per-second="18deg"
            interaction-prompt="none"
            touch-action="pan-y"
            camera-orbit="auto auto auto"
            camera-target="auto auto auto"
            field-of-view="auto"
          />
        )}
        {status === 'loading' && modelUrl && (
          <div className="viewer-status" role="status">
            {t('asset.viewerLoading')}
          </div>
        )}
        {status === 'error' && (
          <div className="viewer-status viewer-status-error" role="status">
            {modelUrl ? t('asset.viewerError') : t('asset.viewerMissing')}
          </div>
        )}
        {(!previewUrl || previewFailed) && status !== 'ready' && (
          <div className="viewer-no-preview">{t('asset.noPreview')}</div>
        )}
      </div>

      <div className="viewer-controls" aria-label={t('asset.viewerControls')}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={resetView}
          disabled={status !== 'ready'}
        >
          <RotateCcw aria-hidden="true" />
          {t('asset.resetView')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={autoRotate ? 'primary' : 'secondary'}
          aria-pressed={autoRotate}
          onClick={() => setAutoRotate((current) => !current)}
          disabled={status !== 'ready'}
        >
          <RotateCw aria-hidden="true" />
          {autoRotate ? t('asset.rotateOff') : t('asset.rotateOn')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void toggleFullscreen()}
          disabled={!fullscreenSupported}
          aria-pressed={fullscreen}
        >
          <Maximize2 aria-hidden="true" />
          {fullscreen ? t('asset.exitFullscreen') : t('asset.enterFullscreen')}
        </Button>
      </div>
      {fullscreenFailed && (
        <p className="viewer-note" role="status">{t('asset.fullscreenUnavailable')}</p>
      )}
    </section>
  );
}
