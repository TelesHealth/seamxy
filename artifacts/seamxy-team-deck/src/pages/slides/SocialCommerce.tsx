export default function SocialCommerce() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            COMMUNITY · MARKETPLACE
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Social &amp; Commerce
          </div>
        </div>

        {/* 5 feature rows */}
        <div className="flex flex-col" style={{ gap: '1.8vh', flex: 1 }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '1.8vh 2vw', gap: '2.5vw' }}>
            <div style={{ minWidth: '18vw' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Style Groups</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#CC1519' }}>/groups/:id</div>
            </div>
            <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999999', lineHeight: 1.5 }}>
              Private friend communities — shared closets, borrow requests (dual-confirmed returns), haul posts with emoji reactions, outfit polls, peer closet sales
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '1.8vh 2vw', gap: '2.5vw' }}>
            <div style={{ minWidth: '18vw' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Let It Go</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#CC1519' }}>/closet/edit</div>
            </div>
            <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999999', lineHeight: 1.5 }}>
              Surfaces items unworn 6+ months → member chooses: Lend (to Style Group) · Sell (Closet Sale) · Donate (value logged for tax) · Keep
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '1.8vh 2vw', gap: '2.5vw' }}>
            <div style={{ minWidth: '18vw' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Shop</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#CC1519' }}>/shop</div>
            </div>
            <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999999', lineHeight: 1.5 }}>
              Product catalog from supplier APIs + affiliates (Etsy, Amazon, eBay, Rakuten). Scored by Fit 50% · Style 30% · Budget 20% against user profile
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '1.8vh 2vw', gap: '2.5vw' }}>
            <div style={{ minWidth: '18vw' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Local Alterations</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#CC1519' }}>/gig</div>
            </div>
            <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999999', lineHeight: 1.5 }}>
              Marketplace for tailors, seamstresses, repair pros. Browse → post job → receive quotes → accept → review. Platform fee: 12% on completed jobs
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '1.8vh 2vw', gap: '2.5vw' }}>
            <div style={{ minWidth: '18vw' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Makers Directory</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#CC1519' }}>/makers</div>
            </div>
            <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999999', lineHeight: 1.5 }}>
              Curated bespoke clothing makers — specialty, price tier, availability. Custom request → quote → production tracking → order management
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
