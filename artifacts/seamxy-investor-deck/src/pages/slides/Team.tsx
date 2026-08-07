export default function Team() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>The Team</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[5vh]"
        style={{ fontSize: '4vw', lineHeight: 1.05 }}
      >
        Built by people who wear clothes
        <span style={{ display: 'block' }}>and understand technology.</span>
      </h2>

      {/* Proof of execution */}
      <div className="flex gap-[3vw] flex-1">
        {/* Left: why us */}
        <div className="flex flex-col" style={{ flex: '1.4' }}>
          <p className="font-body font-semibold text-primary mb-[2.5vh]" style={{ fontSize: '1.7vw' }}>Why this team can build this</p>

          <div className="flex flex-col gap-[2.5vh]">
            <div className="flex gap-[1.5vw] items-start">
              <div className="bg-accent rounded-full mt-[0.8vh]" style={{ width: '0.6vw', height: '0.6vw', flexShrink: 0 }} />
              <div>
                <p className="font-body font-semibold text-primary mb-[0.5vh]" style={{ fontSize: '1.55vw' }}>Full-stack AI expertise</p>
                <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>Anthropic Claude Tool Use API, MediaPipe pose detection, TPS warping — built natively, not bolted on</p>
              </div>
            </div>

            <div className="flex gap-[1.5vw] items-start">
              <div className="bg-accent rounded-full mt-[0.8vh]" style={{ width: '0.6vw', height: '0.6vw', flexShrink: 0 }} />
              <div>
                <p className="font-body font-semibold text-primary mb-[0.5vh]" style={{ fontSize: '1.55vw' }}>Rapid execution velocity</p>
                <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>310+ commits across 10 months — from concept to production-grade platform with 18+ fully built features</p>
              </div>
            </div>

            <div className="flex gap-[1.5vw] items-start">
              <div className="bg-accent rounded-full mt-[0.8vh]" style={{ width: '0.6vw', height: '0.6vw', flexShrink: 0 }} />
              <div>
                <p className="font-body font-semibold text-primary mb-[0.5vh]" style={{ fontSize: '1.55vw' }}>Fashion-native thinking</p>
                <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>Editorial UX, brand-first design, consumer psychology baked into every product decision</p>
              </div>
            </div>

            <div className="flex gap-[1.5vw] items-start">
              <div className="bg-accent rounded-full mt-[0.8vh]" style={{ width: '0.6vw', height: '0.6vw', flexShrink: 0 }} />
              <div>
                <p className="font-body font-semibold text-primary mb-[0.5vh]" style={{ fontSize: '1.55vw' }}>Three-sided marketplace experience</p>
                <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>Simultaneous consumer, community, and B2B platform architecture — rare at this stage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: tech stack proof */}
        <div className="flex flex-col" style={{ flex: '1' }}>
          <p className="font-body font-semibold text-primary mb-[2.5vh]" style={{ fontSize: '1.7vw' }}>Stack signals execution depth</p>

          <div className="rounded-[1vw] flex flex-col gap-[1.8vh]" style={{ background: '#111111', padding: '3vh 2.5vw', flex: 1 }}>
            <div>
              <p className="font-body uppercase tracking-widest text-accent mb-[0.8vh]" style={{ fontSize: '1vw', letterSpacing: '0.18em' }}>AI Layer</p>
              <p className="font-body text-bg" style={{ fontSize: '1.4vw' }}>Anthropic Claude claude-opus-4-5 · Tool Use API · 9 Personas</p>
            </div>
            <div style={{ height: '0.1vh', background: 'rgba(250,249,246,0.12)' }} />
            <div>
              <p className="font-body uppercase tracking-widest text-accent mb-[0.8vh]" style={{ fontSize: '1vw', letterSpacing: '0.18em' }}>Computer Vision</p>
              <p className="font-body text-bg" style={{ fontSize: '1.4vw' }}>MediaPipe · TPS Warping · Live AR Mode</p>
            </div>
            <div style={{ height: '0.1vh', background: 'rgba(250,249,246,0.12)' }} />
            <div>
              <p className="font-body uppercase tracking-widest text-accent mb-[0.8vh]" style={{ fontSize: '1vw', letterSpacing: '0.18em' }}>Infrastructure</p>
              <p className="font-body text-bg" style={{ fontSize: '1.4vw' }}>Supabase · AWS S3 · Stripe · Drizzle ORM</p>
            </div>
            <div style={{ height: '0.1vh', background: 'rgba(250,249,246,0.12)' }} />
            <div>
              <p className="font-body uppercase tracking-widest text-accent mb-[0.8vh]" style={{ fontSize: '1vw', letterSpacing: '0.18em' }}>Security</p>
              <p className="font-body text-bg" style={{ fontSize: '1.4vw' }}>Bcrypt · AES-256-CBC · Full RBAC middleware</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
