export default function MemberFeatures() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            AUTH REQUIRED
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Member Features
          </div>
        </div>

        {/* 2×2 grid */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2vh 2.5vw', flex: 1 }}>

          {/* Dashboard */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '3vh 2.5vw', borderLeft: '0.4vw solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>DASHBOARD · /dashboard</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.8vw', fontWeight: 700, color: '#FAF6F2', marginBottom: '1.5vh' }}>Daily Style Command Center</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Weather-aware daily outfit from your closet</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Weekly capsule edit for the week ahead</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Advisor Notes — AI commentary (Pro only)</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Wardrobe gap analysis + shoppable links</div>
            </div>
          </div>

          {/* Concierge */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '3vh 2.5vw', borderLeft: '0.4vw solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>CONCIERGE · /ai-stylist</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.8vw', fontWeight: 700, color: '#FAF6F2', marginBottom: '1.5vh' }}>Conversational AI Stylist</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Claude claude-opus-4-5 with Tool Use API</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ 9 AI personas (Classic, Bold, Minimalist…)</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Shoppable recommendations, not just text</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Session history persisted per user</div>
            </div>
          </div>

          {/* Try-On */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '3vh 2.5vw', borderLeft: '0.4vw solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>TRY-ON · /upload → /studio</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.8vw', fontWeight: 700, color: '#FAF6F2', marginBottom: '1.5vh' }}>Virtual Dressing Room</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ MediaPipe: 33 body landmark detection</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ TPS warping — garment deformation to body</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ AR mode via device webcam (/ar-try-on)</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Share tokens — public vote links</div>
            </div>
          </div>

          {/* Closet */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '3vh 2.5vw', borderLeft: '0.4vw solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>CLOSET · /closet</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.8vw', fontWeight: 700, color: '#FAF6F2', marginBottom: '1.5vh' }}>Wardrobe Intelligence Layer</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Upload with photo, brand, color, size, price</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Tag Lendable — visible to Style Group</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Wear tracking + estimated wardrobe value</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.6vw', color: '#CCCCCC' }}>→ Let It Go — surfaces idle items (6+ months)</div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
