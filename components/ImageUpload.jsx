'use client'
import { useEffect, useRef, useState } from 'react'
import { Upload, Loader2, ImagePlus } from 'lucide-react'
import { uploadApi, uploadFile } from '@/lib/api-client'
import ImageCropModal from '@/components/ImageCropModal'

// Per-kind crop spec. Aspect = w/h. outputSize is the final pixel size we render to.
const CROP_SPEC = {
  avatar:         { aspect: 1,    outputSize: { width: 512,  height: 512  }, title: 'Adjust your profile photo' },
  banner:         { aspect: 3,    outputSize: { width: 1500, height: 500  }, title: 'Adjust your cover photo' },
  'company-logo': { aspect: 1,    outputSize: { width: 512,  height: 512  }, title: 'Adjust your logo' },
  'company-banner': { aspect: 3,  outputSize: { width: 1500, height: 500  }, title: 'Adjust your cover photo' },
  post:           { aspect: 16/9, outputSize: { width: 1600, height: 900  }, title: 'Crop image' },
  'platform-icon':{ aspect: 1,    outputSize: { width: 256,  height: 256  }, title: 'Crop icon' },
}

/**
 * Drop-in presigned-upload button with a built-in fixed-aspect crop step.
 *
 * <ImageUpload kind="avatar" value={url} onChange={setUrl} />
 */
export default function ImageUpload({ kind = 'avatar', value, onChange, label = 'Upload image', className = '' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [pendingFile, setPendingFile] = useState(null)

  useEffect(() => {
    let cancelled = false
    uploadApi.status()
      .then((r) => { if (!cancelled) setStorageEnabled(Boolean(r?.enabled)) })
      .catch(() => { if (!cancelled) setStorageEnabled(false) })
    return () => { cancelled = true }
  }, [])

  const handlePick = () => inputRef.current?.click()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (!file) return
    setError('')
    setPendingFile(file)
  }

  const uploadBlob = async (blob) => {
    setUploading(true)
    setError('')
    try {
      const ext = blob.type === 'image/png' ? 'png' : 'jpg'
      const named = new File([blob], `${kind}-${Date.now()}.${ext}`, { type: blob.type })
      const url = await uploadFile({ file: named, kind })
      onChange?.(url)
      setPendingFile(null)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (!storageEnabled) {
    return (
      <div className={`text-[11.5px] text-gray-400 italic ${className}`}>
        Upload disabled (storage not configured yet). Paste a URL above instead.
      </div>
    )
  }

  const spec = CROP_SPEC[kind] ?? CROP_SPEC.avatar
  // Preview shape matches the final aspect so users see exactly what they'll get.
  const previewClass =
    spec.aspect === 1 ? 'w-14 h-14 rounded-full'
    : spec.aspect >= 2 ? 'w-32 h-10 rounded-md'
    : 'w-16 h-12 rounded-md'

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className={`${previewClass} object-cover border border-gray-200`} />
        ) : (
          <div className={`${previewClass} bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400`}>
            <ImagePlus className="w-5 h-5" strokeWidth={2} />
          </div>
        )}
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-full text-[12px] font-bold text-gray-700 hover:border-gray-400 disabled:opacity-50 transition"
        >
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> Uploading…</>
            : <><Upload className="w-3.5 h-3.5" strokeWidth={2.5} /> {label}</>}
        </button>
        {value && !uploading && (
          <button type="button" onClick={() => onChange?.('')} className="text-[11.5px] font-semibold text-gray-400 hover:text-red-500 transition">Remove</button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      {error && <div className="text-[11px] text-red-500 mt-1.5 font-semibold">{error}</div>}
      <div className="text-[10.5px] text-gray-400 mt-1">
        {spec.aspect === 1
          ? `Square photo · output ${spec.outputSize.width}×${spec.outputSize.height}`
          : `${spec.aspect}:1 photo · output ${spec.outputSize.width}×${spec.outputSize.height}`}
      </div>

      {pendingFile && (
        <ImageCropModal
          file={pendingFile}
          aspect={spec.aspect}
          outputSize={spec.outputSize}
          title={spec.title}
          onCancel={() => setPendingFile(null)}
          onConfirm={uploadBlob}
        />
      )}
    </div>
  )
}
