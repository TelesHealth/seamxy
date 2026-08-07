export default function DesignSystem() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            TOKENS · TYPOGRAPHY · COMPONENTS
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Design System
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '3vw', flex: 1 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>

            {/* Color tokens */}
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '1vh' }}>
                COLOR TOKENS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
                {[
                  { name: '--primary', hex: '#CC1519', label: 'Crimson — CTA, active, accent' },
                  { name: '--dark', hex: '#111111', label: 'Near-black — dark sections, backgrounds' },
                  { name: '--base', hex: '#FAF6F2', label: 'Warm white — page base' },
                  { name: '--blush', hex: '#FAE8E8', label: 'Blush tint — card surfaces, gradients' },
                  { name: '--muted', hex: '#8A8A8A', label: 'Mid-gray — secondary text' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center" style={{ gap: '1.5vw' }}>
                    <div style={{ width: '3vw', height: '3vh', borderRadius: '0.3vw', background: c.hex, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#CC1519' }}>{c.name}</div>
                      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#777' }}>{c.hex} — {c.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background gradient */}
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '1vh' }}>
                PAGE GRADIENT (.seamxy-bg)
              </div>
              <div
                style={{
                  height: '8vh',
                  borderRadius: '0.6vw',
                  background: 'radial-gradient(ellipse 65% 90% at -5% 50%, rgba(255,170,170,0.32) 0%, transparent 65%), radial-gradient(ellipse 55% 65% at 55% 10%, rgba(255,230,225,0.30) 0%, transparent 60%), radial-gradient(ellipse 55% 70% at 100% 65%, rgba(200,218,255,0.35) 0%, transparent 60%), #FAF6F2',
                  marginBottom: '0.8vh',
                }}
              />
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>
                Blush-rose left → warm cream → soft periwinkle right on #FAF6F2 base
              </div>
            </div>

          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>

            {/* Typography */}
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '1vh' }}>
                TYPOGRAPHY
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
                <div style={{ background: '#1C1C1C', borderRadius: '0.5vw', padding: '1.5vh 1.5vw' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '3vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1 }}>Cormorant Garamond</div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666', marginTop: '0.4vh' }}>Display · Headlines · Emphasis — Google Fonts</div>
                </div>
                <div style={{ background: '#1C1C1C', borderRadius: '0.5vw', padding: '1.5vh 1.5vw' }}>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '2.2vw', fontWeight: 500, color: '#FAF6F2', lineHeight: 1 }}>Inter</div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666', marginTop: '0.4vh' }}>Body · Navigation · UI — Google Fonts</div>
                </div>
              </div>
            </div>

            {/* Component inventory */}
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '1vh' }}>
                KEY COMPONENTS
              </div>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.8vh 1.5vw' }}>
                {[
                  'Header (floating pill nav)',
                  'StyleCTA (sticky widget)',
                  'Style Quiz multi-step',
                  'Try-on canvas suite',
                  'AI chat interface',
                  'Closet item cards',
                  'Dashboard outfit card',
                  'Group haul + poll UI',
                ].map((c) => (
                  <div key={c} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', display: 'flex', alignItems: 'center', gap: '0.6vw' }}>
                    <span style={{ color: '#CC1519', fontSize: '1vw' }}>▸</span>{c}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
