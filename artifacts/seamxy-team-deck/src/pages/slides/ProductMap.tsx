export default function ProductMap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1.2vh' }}>
            NAVIGATION
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
            Product Map
          </div>
        </div>

        {/* Table header */}
        <div
          className="flex items-center"
          style={{ borderBottom: '0.1vh solid #CC1519', paddingBottom: '1.2vh', marginBottom: '0.8vh' }}
        >
          <div style={{ width: '13vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>LABEL</div>
          <div style={{ width: '22vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>ROUTE</div>
          <div style={{ width: '12vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>AUTH</div>
          <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>PURPOSE</div>
        </div>

        {/* Rows */}
        {[
          { label: 'HOME', route: '/', auth: 'Guest', purpose: 'Hero landing — mission, CTA, email capture' },
          { label: 'WORLD', route: '/system', auth: 'Guest', purpose: 'Intelligence system overview — all 7 signals explained' },
          { label: 'FIND LOOK', route: '/get-outfit-ideas', auth: 'Guest', purpose: 'Situational AI styling — describe occasion, get outfits' },
          { label: 'QUIZ', route: '/style-quiz', auth: 'Guest', purpose: 'Taste profiler — builds persistent style identity' },
          { label: 'INSPO', route: '/inspo', auth: 'Guest', purpose: 'Editorial feed — curated looks by category' },
          { label: 'CONCIERGE', route: '/ai-stylist', auth: 'Members', purpose: 'Conversational AI styling — 9 personas, Tool Use API' },
          { label: 'DASHBOARD', route: '/dashboard', auth: 'Members', purpose: 'Daily outfit, weekly edit, advisor notes, gap analysis' },
          { label: 'TRY-ON', route: '/upload → /studio', auth: 'Members', purpose: 'MediaPipe + TPS warping virtual dressing room' },
          { label: 'CLOSET', route: '/closet', auth: 'Members', purpose: 'Full wardrobe inventory, lend, sell, track wear' },
        ].map((row, i) => (
          <div
            key={row.label}
            className="flex items-center"
            style={{
              padding: '1.2vh 0',
              borderBottom: '0.08vh solid #1E1E1E',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
            }}
          >
            <div style={{ width: '13vw' }}>
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>{row.label}</span>
            </div>
            <div style={{ width: '22vw' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#CC1519' }}>{row.route}</span>
            </div>
            <div style={{ width: '12vw' }}>
              <span
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '1.3vw',
                  color: row.auth === 'Guest' ? '#8A8A8A' : '#FAF6F2',
                  fontWeight: row.auth === 'Members' ? 500 : 400,
                }}
              >
                {row.auth === 'Members' ? '🔒 ' : ''}{row.auth}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>{row.purpose}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
