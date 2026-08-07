export default function Monetization() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            STRIPE · WEBHOOKS · REVENUE LOGIC
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Subscription &amp; Monetization
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '3vw', flex: 1 }}>

          {/* Left: Free vs Pro */}
          <div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '1vh' }}>
              FREE vs. PRO TIER
            </div>

            {/* Table header */}
            <div className="flex" style={{ marginBottom: '0.8vh', paddingBottom: '0.8vh', borderBottom: '0.08vh solid #1E1E1E' }}>
              <div style={{ flex: 2, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#555', letterSpacing: '0.08em' }}>FEATURE</div>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#555', letterSpacing: '0.08em' }}>FREE</div>
              <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.08em' }}>PRO</div>
            </div>

            {[
              { feature: 'Find Look / Situational Styling', free: '✓', pro: '✓' },
              { feature: 'Style Quiz', free: '✓', pro: '✓' },
              { feature: 'Closet (limited items)', free: '✓', pro: '✓' },
              { feature: 'Full Closet', free: '—', pro: '✓' },
              { feature: 'AI Concierge', free: 'Limited', pro: 'Unlimited' },
              { feature: 'Dashboard', free: 'Basic', pro: 'Full' },
              { feature: 'Advisor Notes', free: '—', pro: '✓' },
              { feature: 'Capsule Planning', free: '—', pro: '✓' },
              { feature: 'Curated Shopping', free: '—', pro: '✓' },
              { feature: 'Stylist Consults', free: '—', pro: '✓' },
            ].map((row, i) => (
              <div
                key={row.feature}
                className="flex"
                style={{
                  padding: '0.9vh 0',
                  borderBottom: '0.06vh solid #1A1A1A',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
              >
                <div style={{ flex: 2, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: '#BBBBBB' }}>{row.feature}</div>
                <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: row.free === '—' ? '#444' : '#888' }}>{row.free}</div>
                <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', color: row.pro === '✓' || row.pro === 'Unlimited' || row.pro === 'Full' ? '#FAF6F2' : '#888', fontWeight: row.pro !== '—' ? 500 : 400 }}>{row.pro}</div>
              </div>
            ))}
          </div>

          {/* Right: Revenue streams + Stripe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
            {/* Revenue streams */}
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '1vh' }}>
                REVENUE STREAMS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                {[
                  { stream: 'Pro membership', rate: 'Monthly / annual subscription' },
                  { stream: 'Affiliate commissions', rate: '4–10% per referred purchase' },
                  { stream: 'Gig platform fee', rate: '12% of completed job value' },
                  { stream: 'Bespoke order fee', rate: '10% of order value' },
                  { stream: 'Maker subscriptions', rate: 'Tiered monthly fee' },
                  { stream: 'Creator revenue share', rate: '20% of creator sub / tip revenue' },
                ].map((r) => (
                  <div key={r.stream} className="flex items-baseline" style={{ gap: '1.5vw' }}>
                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#FAF6F2', minWidth: '16vw' }}>{r.stream}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.7vw', color: '#CC1519', fontStyle: 'italic' }}>{r.rate}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stripe integration */}
            <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2vh 2vw', borderLeft: '0.4vw solid #CC1519' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1vh' }}>
                STRIPE WEBHOOKS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6vh' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#888' }}>customer.subscription.created</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#888' }}>customer.subscription.updated</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#888' }}>customer.subscription.deleted</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#888' }}>invoice.payment_succeeded</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.4vw', color: '#888' }}>invoice.payment_failed</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
