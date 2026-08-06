export default function BusinessModel() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>Business Model</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[4.5vh]"
        style={{ fontSize: '4vw', lineHeight: 1.05 }}
      >
        Six revenue streams. One platform.
      </h2>

      {/* Revenue streams grid: 3 x 2 */}
      <div className="flex gap-[2vw] flex-1">
        {/* Column 1 */}
        <div className="flex flex-col gap-[2vh] flex-1">
          {/* Stream 1 */}
          <div className="flex-1 rounded-[1vw] flex flex-col justify-between" style={{ background: '#0B1340', padding: '2.5vh 2vw' }}>
            <div>
              <p className="font-body font-semibold text-bg mb-[1vh]" style={{ fontSize: '1.55vw' }}>Pro Membership</p>
              <p className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(250,249,246,0.65)', lineHeight: 1.45 }}>Monthly/annual subscription. Unlimited Concierge, full closet, dashboard, capsule planning, curated shopping.</p>
            </div>
            <p className="font-display font-bold text-accent" style={{ fontSize: '2.2vw', marginTop: '1.5vh' }}>Subscription</p>
          </div>

          {/* Stream 2 */}
          <div className="flex-1 rounded-[1vw] flex flex-col justify-between" style={{ background: '#F5E8E0', padding: '2.5vh 2vw' }}>
            <div>
              <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Affiliate Commissions</p>
              <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.45 }}>Per-referred purchase from Etsy, Amazon, eBay, Rakuten. Fit-ranked products drive higher conversion.</p>
            </div>
            <p className="font-display font-bold text-primary" style={{ fontSize: '2.2vw', marginTop: '1.5vh' }}>4–10% per sale</p>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-[2vh] flex-1">
          {/* Stream 3 */}
          <div className="flex-1 rounded-[1vw] flex flex-col justify-between" style={{ background: '#E8ECF8', padding: '2.5vh 2vw' }}>
            <div>
              <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Gig Economy Fee</p>
              <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.45 }}>Platform fee on every completed alteration, repair, or custom tailoring job matched through SeamXY.</p>
            </div>
            <p className="font-display font-bold text-primary" style={{ fontSize: '2.2vw', marginTop: '1.5vh' }}>12% per job</p>
          </div>

          {/* Stream 4 */}
          <div className="flex-1 rounded-[1vw] flex flex-col justify-between" style={{ background: '#FAF9F6', padding: '2.5vh 2vw', border: '0.1vw solid #E0DDD8' }}>
            <div>
              <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Bespoke Orders</p>
              <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.45 }}>Fee on custom orders placed through the Makers Directory — bespoke pieces commissioned directly.</p>
            </div>
            <p className="font-display font-bold text-primary" style={{ fontSize: '2.2vw', marginTop: '1.5vh' }}>10% per order</p>
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-[2vh] flex-1">
          {/* Stream 5 */}
          <div className="flex-1 rounded-[1vw] flex flex-col justify-between" style={{ background: '#FAF9F6', padding: '2.5vh 2vw', border: '0.1vw solid #E0DDD8' }}>
            <div>
              <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Supplier Subscriptions</p>
              <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.45 }}>Tiered monthly fee for brands and makers in the Supplier Portal — catalog, analytics, AI matching.</p>
            </div>
            <p className="font-display font-bold text-primary" style={{ fontSize: '2.2vw', marginTop: '1.5vh' }}>Tiered SaaS</p>
          </div>

          {/* Stream 6 */}
          <div className="flex-1 rounded-[1vw] flex flex-col justify-between" style={{ background: '#1A2560', padding: '2.5vh 2vw' }}>
            <div>
              <p className="font-body font-semibold text-bg mb-[1vh]" style={{ fontSize: '1.55vw' }}>Creator Revenue Share</p>
              <p className="font-body" style={{ fontSize: '1.35vw', lineHeight: 1.45, color: 'rgba(250,249,246,0.65)' }}>Stylists monetize via subscriptions, tips, and custom requests. Platform takes 20%; creator keeps 80%.</p>
            </div>
            <p className="font-display font-bold text-accent" style={{ fontSize: '2.2vw', marginTop: '1.5vh' }}>20% platform share</p>
          </div>
        </div>
      </div>
    </div>
  );
}
