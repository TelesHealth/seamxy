export default function B2BPlatform() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            B2B · BUSINESS TOOLS
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            B2B Platform
          </div>
        </div>

        {/* 3 large cards */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5vw', flex: 1 }}>

          {/* Creator Studio */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.8vw', padding: '3.5vh 2.5vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.2vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh' }}>
              CREATOR STUDIO
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#555', marginBottom: '2vh' }}>/for-creators · /creators · /creator/:handle</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.6vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '2.5vh', lineHeight: 1.1 }}>
              Monetized Stylist Platform
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh', flex: 1 }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Public stylist profile + portfolio</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Subscription tiers for exclusive content</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Tip system for advice</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Custom session intake</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Affiliate analytics dashboard</div>
            </div>
            <div style={{ marginTop: '2vh', paddingTop: '2vh', borderTop: '0.08vh solid #2A2A2A' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2vw', fontWeight: 700, color: '#CC1519' }}>80/20</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>creator / platform revenue split</div>
            </div>
          </div>

          {/* Supplier Portal */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.8vw', padding: '3.5vh 2.5vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.2vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh' }}>
              SUPPLIER PORTAL
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#555', marginBottom: '2vh' }}>/supplier/*</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.6vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '2.5vh', lineHeight: 1.1 }}>
              Full B2B Brand Dashboard
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh', flex: 1 }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Products — catalog, bulk upload, inventory</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Orders — fulfillment + custom requests</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Integrations — Shopify, WooCommerce, BigCommerce</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>AI Training — teach SeamXY your aesthetic</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Analytics — views, conversions, revenue</div>
            </div>
            <div style={{ marginTop: '2vh', paddingTop: '2vh', borderTop: '0.08vh solid #2A2A2A' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>Separate supplier auth track</div>
            </div>
          </div>

          {/* Admin Panel */}
          <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.8vw', padding: '3.5vh 2.5vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.2vw', letterSpacing: '0.15em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh' }}>
              ADMIN PANEL
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#555', marginBottom: '2vh' }}>/admin/*</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.6vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '2.5vh', lineHeight: 1.1 }}>
              Internal Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh', flex: 1 }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>User management + VIP account creation</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Maker + creator verification &amp; approval</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Subscription plan + pricing config</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Commission configuration</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#CCCCCC' }}>Audit logs — all privileged actions recorded</div>
            </div>
            <div style={{ marginTop: '2vh', paddingTop: '2vh', borderTop: '0.08vh solid #2A2A2A' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#666' }}>Admin-only RBAC middleware</div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
