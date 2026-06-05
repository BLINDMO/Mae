// Selectable app fonts, applied live via the --font CSS variable.
export const FONTS = [
  { id: 'inter', label: 'Inter', note: 'Clean & modern', stack: "'Inter', system-ui, sans-serif" },
  { id: 'jakarta', label: 'Plus Jakarta Sans', note: 'Friendly geometric', stack: "'Plus Jakarta Sans', system-ui, sans-serif" },
  { id: 'manrope', label: 'Manrope', note: 'Soft & rounded', stack: "'Manrope', system-ui, sans-serif" },
  { id: 'sora', label: 'Sora', note: 'Crisp & techy', stack: "'Sora', system-ui, sans-serif" },
  { id: 'nunito', label: 'Nunito', note: 'Warm & gentle', stack: "'Nunito', system-ui, sans-serif" },
  { id: 'fraunces', label: 'Fraunces', note: 'Elegant serif', stack: "'Fraunces', Georgia, serif" }
]

export function getFontId() {
  return localStorage.getItem('hoh_font') || 'inter'
}

export function applyFont(id) {
  const f = FONTS.find((x) => x.id === id) || FONTS[0]
  document.documentElement.style.setProperty('--font', f.stack)
  localStorage.setItem('hoh_font', f.id)
  return f.id
}
