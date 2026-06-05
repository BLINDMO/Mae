// Clean line icons (Lucide-style) so the UI doesn't rely on emoji.
const ICONS = {
  home: () => <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
  smile: () => (<>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M8.5 14.5s1.4 2 3.5 2 3.5-2 3.5-2" />
    <path d="M9 9.5h.01M15 9.5h.01" />
  </>),
  image: () => (<>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.8" cy="8.8" r="1.8" />
    <path d="m21 15-4.2-4.2a2 2 0 0 0-2.8 0L5 20" />
  </>),
  mail: () => (<>
    <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
    <path d="m3 7 8 5.3a2 2 0 0 0 2 0L21 7" />
  </>),
  star: () => <path d="M11.5 2.4a.6.6 0 0 1 1 0l2.4 5 5.4.8a.6.6 0 0 1 .3 1l-3.9 3.8.9 5.4a.6.6 0 0 1-.85.6L12 16.9l-4.8 2.5a.6.6 0 0 1-.85-.6l.9-5.4-3.9-3.8a.6.6 0 0 1 .3-1l5.4-.8z" />,
  camera: () => (<>
    <path d="M14.5 4.5h-5L7 7.5H4.5A2.5 2.5 0 0 0 2 10v8a2.5 2.5 0 0 0 2.5 2.5h15A2.5 2.5 0 0 0 22 18v-8a2.5 2.5 0 0 0-2.5-2.5H17z" />
    <circle cx="12" cy="13.5" r="3.2" />
  </>),
  left: () => <path d="m15 18-6-6 6-6" />,
  right: () => <path d="m9 18 6-6-6-6" />,
  up: () => <path d="m18 15-6-6-6 6" />,
  settings: () => (<>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>),
  book: () => <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />,
  plus: () => <path d="M12 5v14M5 12h14" />,
  check: () => <path d="M20 6 9 17l-5-5" />,
  x: () => <path d="M18 6 6 18M6 6l12 12" />,
  trash: () => <path d="M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M10 11v6M14 11v6" />,
  play: () => <path d="M7 4.5v15l12-7.5z" />,
  pause: () => <path d="M9 4.5H6.5v15H9zM17.5 4.5H15v15h2.5z" />,
  upload: () => <path d="M12 16V4 M7 9l5-5 5 5 M5 20h14" />,
  film: () => (<>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 8h18M3 16h18M8 3v18M16 3v18" />
  </>),
  pencil: () => <path d="M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />,
  lock: () => (<>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
  </>),
  shield: () => <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  download: () => <path d="M12 4v12 M7 11l5 5 5-5 M5 20h14" />,
  restore: () => <path d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 4v4h4" />,
  delete2: () => <path d="M18 6 6 18M6 6l12 12" />
}

export default function Icon({ name, size = 22, stroke = 2, fill = false, className, style }) {
  const render = ICONS[name]
  if (!render) return null
  const filled = fill
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
    >
      {render()}
    </svg>
  )
}
