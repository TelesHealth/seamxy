export default function AIArchitecture() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            ANTHROPIC · CLAUDE
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            AI Architecture
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2.5vw', flex: 1 }}>

          {/* Left: Core model config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            {/* Model */}
            <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', borderLeft: '0.4vw solid #CC1519' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>MODEL</div>
              <div style={{ fontFamily: 'monospace', fontSize: '2.2vw', color: '#FAF6F2', marginBottom: '0.8vh' }}>claude-opus-4-5</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#888' }}>Anthropic Tool Use API — model can call back into the product catalog to surface shoppable, real recommendations</div>
            </div>

            {/* Session persistence */}
            <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', borderLeft: '0.4vw solid #CC1519' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>SESSION PERSISTENCE</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC', lineHeight: 1.6 }}>
                Conversation history stored per user in <span style={{ fontFamily: 'monospace', color: '#CC1519' }}>ai_sessions</span> + <span style={{ fontFamily: 'monospace', color: '#CC1519' }}>ai_messages</span> tables. Context carries across sessions — the AI remembers your style profile, closet, and past conversations.
              </div>
            </div>

            {/* Context fed to Claude */}
            <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', borderLeft: '0.4vw solid #CC1519' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>CONTEXT INJECTED PER REQUEST</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8vh 1vw' }}>
                {['style quiz results', 'body measurements', 'closet contents', 'calendar context', 'engagement history', 'budget range'].map((item) => (
                  <span key={item} style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#AAAAAA', background: '#151515', padding: '0.4vh 0.8vw', borderRadius: '0.3vw', border: '0.08vh solid #2A2A2A' }}>{item}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: 9 Personas */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '2vh' }}>
              9 AI STYLIST PERSONAS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4vh', flex: 1 }}>
              {[
                { name: 'Classic', desc: 'Timeless, refined — investment pieces, clean lines' },
                { name: 'Bold', desc: 'Statement dressing, color-forward, fashion-risk ready' },
                { name: 'Minimalist', desc: 'Reduction, negative space, monochrome mastery' },
                { name: 'Streetwear', desc: 'Culture-driven, sneaker-first, logo and hype' },
                { name: 'Editorial', desc: 'Magazine aesthetic, conceptual, avant-garde' },
                { name: 'Romantic', desc: 'Soft silhouettes, floral, feminine details' },
                { name: 'Androgynous', desc: 'Gender-fluid, tailoring, boundary-blurring' },
                { name: 'Boho', desc: 'Free-spirited, natural fabrics, layered textures' },
                { name: 'Athleisure', desc: 'Performance-meets-lifestyle, utility-forward' },
              ].map((p) => (
                <div key={p.name} className="flex items-baseline" style={{ gap: '1vw' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8vw', fontWeight: 600, color: '#FAF6F2', minWidth: '11vw' }}>{p.name}</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#777' }}>{p.desc}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
