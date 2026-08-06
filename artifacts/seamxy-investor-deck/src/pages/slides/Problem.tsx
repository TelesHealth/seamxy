export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Top rule */}
      <div className="flex items-center gap-[2vw] mb-[5vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>The Problem</p>
      </div>

      {/* Headline */}
      <h2
        className="font-display font-bold text-primary mb-[6vh]"
        style={{ fontSize: '4.8vw', lineHeight: 1.05, letterSpacing: '-0.01em', maxWidth: '65vw' }}
      >
        Full closet. Empty ideas.
      </h2>

      {/* Three problem cards */}
      <div className="flex gap-[2.5vw] flex-1">
        {/* Card 1 */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#F5E8E0', padding: '3.5vh 2.5vw' }}>
          <p className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: '3.5vw', lineHeight: 1.0 }}>80%</p>
          <p className="font-body font-semibold text-primary mb-[1.5vh]" style={{ fontSize: '1.6vw' }}>of closet sits unworn</p>
          <p className="font-body text-muted" style={{ fontSize: '1.45vw', lineHeight: 1.5 }}>Most people wear the same fraction of their wardrobe repeatedly — the rest is invisible, forgotten, and wasted.</p>
        </div>

        {/* Card 2 */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#E8ECF8', padding: '3.5vh 2.5vw' }}>
          <p className="font-display font-bold text-primary mb-[2vh]" style={{ fontSize: '3.5vw', lineHeight: 1.0 }}>Zero</p>
          <p className="font-body font-semibold text-primary mb-[1.5vh]" style={{ fontSize: '1.6vw' }}>system connecting the dots</p>
          <p className="font-body text-muted" style={{ fontSize: '1.45vw', lineHeight: 1.5 }}>Shopping, styling, fitting, and social inspiration live in separate apps with no shared intelligence between them.</p>
        </div>

        {/* Card 3 */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#0B1340', padding: '3.5vh 2.5vw' }}>
          <p className="font-display font-bold text-accent mb-[2vh]" style={{ fontSize: '3.5vw', lineHeight: 1.0 }}>$1.7T</p>
          <p className="font-body font-semibold text-bg mb-[1.5vh]" style={{ fontSize: '1.6vw' }}>fashion market, fragmented</p>
          <p className="font-body" style={{ fontSize: '1.45vw', lineHeight: 1.5, color: 'rgba(250,249,246,0.7)' }}>The global fashion industry runs on guesswork — brands, stylists, and shoppers lack a unified intelligence layer.</p>
        </div>
      </div>
    </div>
  );
}
