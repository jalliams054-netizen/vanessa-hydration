import { useEffect, useRef } from 'react'

const GRAVITY = 980

const teardrop = (ctx, r) => {
  ctx.beginPath()
  ctx.moveTo(0, -r * 1.7)
  ctx.bezierCurveTo(r * 0.95, -r * 0.35, r * 0.85, r, 0, r)
  ctx.bezierCurveTo(-r * 0.85, r, -r * 0.95, -r * 0.35, 0, -r * 1.7)
  ctx.closePath()
}

export default function DropletBurst({ trigger, tone, count = 64 }) {
  const canvasRef = useRef(null)
  const toneRef = useRef(tone)

  useEffect(() => {
    toneRef.current = tone
  }, [tone])

  useEffect(() => {
    if (!trigger) return undefined
    const canvas = canvasRef.current
    if (!canvas) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return undefined

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const palette = [toneRef.current.wave.crest, toneRef.current.wave.deep, toneRef.current.wave.foam]
    const w = rect.width
    const h = rect.height

    const particles = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.35
      const speed = 210 + Math.random() * 340
      return {
        x: w * 0.5 + (Math.random() - 0.5) * w * 0.35,
        y: h * 0.42 + (Math.random() - 0.5) * h * 0.05,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 3 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 7,
        life: 0,
        ttl: 0.85 + Math.random() * 0.75,
        color: palette[Math.floor(Math.random() * palette.length)],
      }
    })

    let raf = 0
    let last = performance.now()

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.034)
      last = now
      ctx.clearRect(0, 0, w, h)

      let alive = 0
      for (const p of particles) {
        p.life += dt
        if (p.life >= p.ttl) continue
        alive += 1
        p.vy += GRAVITY * dt
        p.vx *= 0.99
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.spin * dt

        ctx.save()
        ctx.globalAlpha = Math.max(0, 1 - p.life / p.ttl) ** 1.4
        ctx.translate(p.x, p.y)
        ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2 + p.rot * 0.15)
        ctx.fillStyle = p.color
        teardrop(ctx, p.r)
        ctx.fill()
        ctx.globalAlpha *= 0.5
        ctx.fillStyle = '#ffffff'
        teardrop(ctx, p.r * 0.42)
        ctx.fill()
        ctx.restore()
      }

      if (alive > 0) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [trigger, count])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  )
}
