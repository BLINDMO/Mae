import { useEffect } from 'react'

// Plays the "fold the letter, slip it in an envelope, send to the letter box"
// animation, then calls onDone. Pure CSS keyframes drive the motion.
export default function FoldAnimation({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2700)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="fold-stage">
      <div className="mailbox-target">📮</div>
      <div className="fold-letter">
        <div className="fold-paper" />
        <div className="fold-third top" />
        <div className="fold-third bot" />
        <div className="fold-envelope">
          <div className="env-body" />
          <div className="env-flap" />
          <div className="env-heart">💛</div>
        </div>
      </div>
      <div className="fold-caption">Tucked safely away 💌</div>
    </div>
  )
}
