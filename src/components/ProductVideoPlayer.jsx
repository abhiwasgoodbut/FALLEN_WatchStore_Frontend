import React from 'react'

export function parseVideo(url) {
  if (!url) return null
  const trimmed = url.trim()

  // Match Mux URL: stream.mux.com/<id>.m3u8 or player.mux.com/<id>
  const muxMatch = trimmed.match(/(?:stream\.mux\.com|player\.mux\.com)\/([a-zA-Z0-9_-]+)/)
  if (muxMatch) {
    return { type: 'mux', playbackId: muxMatch[1].replace('.m3u8', '') }
  }

  // If user pasted raw Mux Playback ID (alphanumeric string)
  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed) && !trimmed.startsWith('http')) {
    return { type: 'mux', playbackId: trimmed }
  }

  // YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` }
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }

  // Direct MP4 / WebM / other video URL
  return { type: 'direct', src: trimmed }
}

export function getVideoThumbnail(url, fallbackImage = '') {
  const video = parseVideo(url)
  if (!video) return fallbackImage

  if (video.type === 'mux') {
    return `https://image.mux.com/${video.playbackId}/thumbnail.png?width=250`
  }
  if (video.type === 'youtube') {
    const id = video.embedUrl.split('/').pop()
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  }
  return fallbackImage
}

export default function ProductVideoPlayer({ videoUrl, style = {} }) {
  const video = parseVideo(videoUrl)
  if (!video) return null

  if (video.type === 'mux') {
    return (
      <div
        className="product-video-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#000',
          ...style,
        }}
      >
        <iframe
          src={`https://player.mux.com/${video.playbackId}`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          title="Product Video"
        />
      </div>
    )
  }

  if (video.type === 'youtube' || video.type === 'vimeo') {
    return (
      <div
        className="product-video-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#000',
          ...style,
        }}
      >
        <iframe
          src={video.embedUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Product Video"
        />
      </div>
    )
  }

  return (
    <div
      className="product-video-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#000',
        ...style,
      }}
    >
      <video
        src={video.src}
        controls
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}
