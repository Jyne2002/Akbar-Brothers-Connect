import { useEffect, useMemo, useRef, useState } from 'react';

const EDITOR_SIZE = 280;
const EXPORT_SIZE = 640;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const DEFAULT_IMAGE_TYPE = 'image/jpeg';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getImageType = (imageSrc) => {
  const typeMatch = String(imageSrc || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);/);

  if (!typeMatch?.[1]) {
    return DEFAULT_IMAGE_TYPE;
  }

  return typeMatch[1] === 'image/png' ? 'image/png' : DEFAULT_IMAGE_TYPE;
};

const getRenderMetrics = (imageSize, zoom) => {
  if (!imageSize?.width || !imageSize?.height) {
    return {
      renderScale: 1,
      renderedWidth: EDITOR_SIZE,
      renderedHeight: EDITOR_SIZE,
      maxOffsetX: 0,
      maxOffsetY: 0,
    };
  }

  const baseScale = Math.max(EDITOR_SIZE / imageSize.width, EDITOR_SIZE / imageSize.height);
  const renderScale = baseScale * zoom;
  const renderedWidth = imageSize.width * renderScale;
  const renderedHeight = imageSize.height * renderScale;

  return {
    renderScale,
    renderedWidth,
    renderedHeight,
    maxOffsetX: Math.max(0, (renderedWidth - EDITOR_SIZE) / 2),
    maxOffsetY: Math.max(0, (renderedHeight - EDITOR_SIZE) / 2),
  };
};

const ProfileImageEditorModal = ({ imageSrc, alt, onClose, onApply }) => {
  const imageRef = useRef(null);
  const dragStateRef = useRef(null);
  const [imageSize, setImageSize] = useState(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isApplying, setIsApplying] = useState(false);
  const [loadError, setLoadError] = useState('');

  const metrics = useMemo(() => getRenderMetrics(imageSize, zoom), [imageSize, zoom]);

  const clampPosition = (nextPosition, nextZoom = zoom) => {
    const { maxOffsetX, maxOffsetY } = getRenderMetrics(imageSize, nextZoom);

    return {
      x: clamp(nextPosition.x, -maxOffsetX, maxOffsetX),
      y: clamp(nextPosition.y, -maxOffsetY, maxOffsetY),
    };
  };

  useEffect(() => {
    if (!imageSrc) {
      return undefined;
    }

    let isCancelled = false;
    const image = new Image();

    image.onload = () => {
      if (isCancelled) {
        return;
      }

      setImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      setLoadError('');
    };

    image.onerror = () => {
      if (isCancelled) {
        return;
      }

      setImageSize(null);
      setLoadError('We could not load this image. Please try another file.');
    };

    image.src = imageSrc;

    return () => {
      isCancelled = true;
    };
  }, [imageSrc]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isApplying) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isApplying, onClose]);

  const handlePointerDown = (event) => {
    if (!imageSize) {
      return;
    }

    event.preventDefault();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    setPosition(
      clampPosition({
        x: dragState.startPosition.x + deltaX,
        y: dragState.startPosition.y + deltaY,
      }),
    );
  };

  const handlePointerUp = (event) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleZoomChange = (event) => {
    const nextZoom = Number(event.target.value);

    setZoom(nextZoom);
    setPosition((currentPosition) => clampPosition(currentPosition, nextZoom));
  };

  const handleApply = () => {
    const imageElement = imageRef.current;

    if (!imageElement || !imageSize) {
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      setLoadError('We could not prepare this image. Please try again.');
      return;
    }

    setIsApplying(true);

    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    const { renderScale, renderedWidth, renderedHeight } = metrics;
    const clampedPosition = clampPosition(position);
    const sourceX =
      ((renderedWidth - EDITOR_SIZE) / 2 - clampedPosition.x) / renderScale;
    const sourceY =
      ((renderedHeight - EDITOR_SIZE) / 2 - clampedPosition.y) / renderScale;
    const sourceSize = EDITOR_SIZE / renderScale;
    const exportType = getImageType(imageSrc);

    context.clearRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
    context.drawImage(
      imageElement,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      EXPORT_SIZE,
      EXPORT_SIZE,
    );

    const nextImage =
      exportType === 'image/png'
        ? canvas.toDataURL(exportType)
        : canvas.toDataURL(exportType, 0.92);

    onApply(nextImage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
      <button
        type="button"
        aria-label="Close image editor"
        className="absolute inset-0 cursor-default"
        onClick={() => !isApplying && onClose()}
      />

      <div className="relative z-10 w-full max-w-xl rounded-[2rem] border border-white/15 bg-[#151515] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
              Adjust Picture
            </p>
            <h3 className="mt-2 text-2xl font-black">Fit your photo into the frame</h3>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Drag to reposition and use the zoom slider until the face sits comfortably inside the
              circle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => !isApplying && onClose()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-xl font-semibold text-white/80 transition hover:bg-white/12"
          >
            x
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <div
            className="relative h-[280px] w-[280px] touch-none overflow-hidden rounded-[1.8rem] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_rgba(255,255,255,0.04)_45%,_rgba(255,255,255,0.02))]"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {imageSrc && !loadError ? (
              <img
                ref={imageRef}
                src={imageSrc}
                alt={alt || 'Profile image adjustment preview'}
                draggable="false"
                className="absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: `${metrics.renderedWidth}px`,
                  height: `${metrics.renderedHeight}px`,
                  transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                }}
              />
            ) : null}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-full border-[3px] border-white shadow-[0_0_0_999px_rgba(0,0,0,0.42)]"
            />

            {!imageSize && !loadError ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/72">
                Loading image...
              </div>
            ) : null}

            {loadError ? (
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm leading-6 text-white/80">
                {loadError}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-4 text-sm text-white/70">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            disabled={!imageSize || Boolean(loadError)}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/18 accent-white disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!imageSize || Boolean(loadError)}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Use this fit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageEditorModal;
