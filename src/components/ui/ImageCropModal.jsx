import { useCallback, useEffect, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Loader2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'

/**
 * Modal that lets the user crop an image to a fixed aspect ratio before upload.
 *
 * Props:
 *  - file: File the user picked
 *  - aspect: number (width/height, e.g. 1 for square, 3 for 3:1 banner)
 *  - outputSize: { width, height } in pixels — canvas is rendered at this size
 *  - title: header text
 *  - onCancel(): close without uploading
 *  - onConfirm(blob): user confirmed crop; receive the cropped JPEG/PNG Blob
 */
export default function ImageCropModal({
  file,
  aspect = 1,
  outputSize = { width: 800, height: 800 },
  title = 'Adjust your photo',
  onCancel,
  onConfirm,
}) {
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [busy, setBusy] = useState(false)

  // Read the file into a data URL for the cropper.
  useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setImageSrc(e.target?.result)
    reader.readAsDataURL(file)
  }, [file])

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const confirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setBusy(true)
    try {
      const blob = await renderCroppedBlob(imageSrc, croppedAreaPixels, outputSize, file?.type || 'image/jpeg')
      await onConfirm(blob)
    } finally {
      setBusy(false)
    }
  }

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white animate-spin" strokeWidth={2.5} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-[15px] font-extrabold">{title}</h3>
          <button onClick={onCancel} aria-label="Close" className="text-gray-400 hover:text-gray-700 transition">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative w-full bg-gray-900" style={{ height: aspect >= 2 ? 220 : 360 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={aspect === 1 ? 'round' : 'rect'}
            showGrid={aspect !== 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={true}
          />
        </div>

        <div className="px-5 py-3 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <ZoomOut className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-accent"
              aria-label="Zoom"
            />
            <ZoomIn className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <button onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }) }}
              aria-label="Reset"
              className="text-gray-400 hover:text-gray-700 transition">
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onCancel} disabled={busy}
              className="px-4 py-2 border border-gray-200 rounded-full text-[12.5px] font-semibold text-gray-500 hover:border-gray-400 transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={confirm} disabled={busy || !croppedAreaPixels}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-accent hover:bg-accent-dk text-white text-[12.5px] font-bold rounded-full transition disabled:opacity-50">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />}
              {busy ? 'Uploading…' : 'Apply & upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Draw the cropped region to an offscreen canvas at the target output size and
 * return a Blob. Preserves the source MIME type when possible; falls back to JPEG.
 */
async function renderCroppedBlob(imageSrc, areaPixels, outputSize, mime) {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = outputSize.width
  canvas.height = outputSize.height
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    img,
    areaPixels.x, areaPixels.y, areaPixels.width, areaPixels.height,
    0, 0, outputSize.width, outputSize.height
  )

  // PNG keeps transparency; otherwise JPEG at 0.92 stays under our 5MB cap easily.
  const outputMime = mime === 'image/png' ? 'image/png' : 'image/jpeg'
  const quality = outputMime === 'image/jpeg' ? 0.92 : undefined
  return await new Promise((resolve) => canvas.toBlob(resolve, outputMime, quality))
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
