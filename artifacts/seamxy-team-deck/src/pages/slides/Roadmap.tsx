export default function Roadmap() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            CURRENT TASK QUEUE · AUGUST 2026
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Task Queue &amp; Roadmap
          </div>
        </div>

        {/* Table header */}
        <div className="flex" style={{ borderBottom: '0.1vh solid #CC1519', paddingBottom: '1vh', marginBottom: '0.5vh' }}>
          <div style={{ width: '5.5vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>REF</div>
          <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>TASK</div>
          <div style={{ width: '10vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>AREA</div>
          <div style={{ width: '13vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>STATUS</div>
        </div>

        {/* Implemented tasks */}
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#7</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#555' }}>Member actions on inner pages (sign-up prompt swap)</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#555' }}>UX</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#4CAF50', background: 'rgba(76,175,80,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>IMPLEMENTED</span></div>
        </div>
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A', background: 'rgba(255,255,255,0.012)' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#8</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#555' }}>Guest Concierge preview — teaser before sign-in</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#555' }}>UX</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#4CAF50', background: 'rgba(76,175,80,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>IMPLEMENTED</span></div>
        </div>
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#9</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#555' }}>Mobile-responsive editorial layouts</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#555' }}>Frontend</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#4CAF50', background: 'rgba(76,175,80,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>IMPLEMENTED</span></div>
        </div>

        {/* Proposed tasks */}
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A', background: 'rgba(255,255,255,0.012)' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#4</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Catch page-load regressions before they reach live</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>QA</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#8A8A8A', background: 'rgba(138,138,138,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>PROPOSED</span></div>
        </div>
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#5</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Reduce initial page load time</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>Performance</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#8A8A8A', background: 'rgba(138,138,138,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>PROPOSED</span></div>
        </div>
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A', background: 'rgba(255,255,255,0.012)' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#6</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Apply brand tokens to remaining pages</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>Design</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#8A8A8A', background: 'rgba(138,138,138,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>PROPOSED</span></div>
        </div>
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#16</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Native iOS &amp; Android mobile app</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>Mobile</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#8A8A8A', background: 'rgba(138,138,138,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>PROPOSED</span></div>
        </div>
        <div className="flex items-center" style={{ padding: '1.15vh 0', borderBottom: '0.06vh solid #1A1A1A', background: 'rgba(255,255,255,0.012)' }}>
          <div style={{ width: '5.5vw' }}><span style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#555' }}>#15</span></div>
          <div style={{ flex: 1 }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Export investor deck as downloadable PPTX</span></div>
          <div style={{ width: '10vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>Decks</span></div>
          <div style={{ width: '13vw' }}><span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', fontWeight: 600, color: '#8A8A8A', background: 'rgba(138,138,138,0.1)', padding: '0.3vh 0.8vw', borderRadius: '0.3vw' }}>PROPOSED</span></div>
        </div>

      </div>

      <div className="absolute bottom-0 right-0 flex items-center" style={{ padding: '2.5vh 5vw', gap: '1.5vw' }}>
        <div style={{ width: '3vw', height: '0.15vh', background: '#2A2A2A' }} />
        <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.6vw', color: '#333', letterSpacing: '0.2em' }}>SeamXY Internal · August 2026</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
