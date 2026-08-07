export default function APISurface() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            EXPRESS.JS · registerRoutes() · server/routes.ts
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            API Surface
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.8vh 3vw', flex: 1 }}>

          {/* Auth */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/auth</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /register — bcrypt hash, session cookie</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /login — validate + set session</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>GET /me · POST /logout</div>
          </div>

          {/* Users */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/users</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST / · GET /:id · PATCH /:id</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /:id/analyze-style — quiz → style profile</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>POST /measurements · GET /:userId/measurements</div>
          </div>

          {/* AI */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/ai-sessions</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET /ai-personas — fetch persona list</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /ai-sessions — create session + persona</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>POST /:sessionId/messages — Claude response</div>
          </div>

          {/* Products */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/products</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET / · GET /:id · POST /</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET /:id/compare-prices — real-time price compare</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>POST /price-alerts · GET /price-alerts</div>
          </div>

          {/* Makers / Custom Requests */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/makers · /custom-requests</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET /makers · GET /makers/:id · POST /makers</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /custom-requests — submit bespoke request</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>POST /quotes · POST /quotes/:id/accept</div>
          </div>

          {/* Stylists */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/stylists</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET / · GET /:handle · GET /:handle/portfolio</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /:handle/rfq — request custom styling session</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>POST /:handle/follow · POST /:handle/review</div>
          </div>

          {/* Supplier */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/supplier</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /register · POST /login · GET /me</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET+POST /retailer/products · /tailor/portfolio</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>GET /analytics · /messages · /orders</div>
          </div>

          {/* Admin */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.5vh 1.8vw' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5vw', color: '#CC1519', fontWeight: 600, marginBottom: '0.8vh' }}>/api/v1/admin</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>POST /login — separate admin auth</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888', marginBottom: '0.3vh' }}>GET+POST+PATCH /users · /makers/:id/verify</div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#888' }}>GET /audit-logs · /pricing-configs · /subscription-plans</div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
