import { useEffect } from 'react'

// The letter folds down, an envelope rises, the flap shuts and a wax seal
// presses on — then it's tucked into the letter box. Pure CSS keyframes.
export default function SealAnimation({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className="seal-stage">
      <div className="seal-scene">
        <div className="seal-paper">
          <div className="line" /><div className="line" /><div className="line" /><div className="line" />
        </div>
        <div className="seal-env">
          <div className="body" />
          <div className="pocket" />
          <div className="flap" />
          <div className="wax">H</div>
        </div>
        <div className="seal-caption">Sealed & tucked away</div>
      </div>
    </div>
  )
}
