export default function Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3.5vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>Market Opportunity</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[6vh]"
        style={{ fontSize: '4vw', lineHeight: 1.05, letterSpacing: '-0.01em' }}
      >
        Fashion is a $1.7 trillion industry
        <span style={{ display: 'block' }}>waiting to be intelligently connected.</span>
      </h2>

      {/* Three market tiers */}
      <div className="flex gap-[2.5vw] flex-1 items-center">
        {/* TAM */}
        <div className="flex-1 flex flex-col" style={{ borderTop: '0.4vh solid #CC1519', paddingTop: '3vh' }}>
          <p className="font-body text-accent uppercase tracking-widest mb-[2vh]" style={{ fontSize: '1.1vw', letterSpacing: '0.2em' }}>TAM</p>
          <p
            className="font-display font-bold text-primary mb-[2vh]"
            style={{ fontSize: '6.5vw', lineHeight: 1.0 }}
          >
            $1.7T
          </p>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.6vw' }}>Global fashion market</p>
          <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>Apparel, footwear, accessories — the full market SeamXY's intelligence layer serves</p>
        </div>

        {/* Divider */}
        <div className="bg-muted self-stretch" style={{ width: '0.1vw', opacity: 0.3 }} />

        {/* SAM */}
        <div className="flex-1 flex flex-col" style={{ borderTop: '0.4vh solid #111111', paddingTop: '3vh' }}>
          <p className="font-body text-muted uppercase tracking-widest mb-[2vh]" style={{ fontSize: '1.1vw', letterSpacing: '0.2em' }}>SAM</p>
          <p
            className="font-display font-bold text-primary mb-[2vh]"
            style={{ fontSize: '6.5vw', lineHeight: 1.0 }}
          >
            ~$150B
          </p>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.6vw' }}>Fashion tech serviceable market</p>
          <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>Fashion e-commerce, personal styling, and AI-assisted shopping services (est.)</p>
        </div>

        {/* Divider */}
        <div className="bg-muted self-stretch" style={{ width: '0.1vw', opacity: 0.3 }} />

        {/* SOM */}
        <div className="flex-1 flex flex-col" style={{ borderTop: '0.4vh solid #111111', paddingTop: '3vh' }}>
          <p className="font-body text-muted uppercase tracking-widest mb-[2vh]" style={{ fontSize: '1.1vw', letterSpacing: '0.2em' }}>SOM</p>
          <p
            className="font-display font-bold text-primary mb-[2vh]"
            style={{ fontSize: '6.5vw', lineHeight: 1.0 }}
          >
            ~$8B
          </p>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.6vw' }}>5-year reachable market</p>
          <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.5 }}>Style-forward consumers in English-speaking markets — our initial target cohort (est.)</p>
        </div>
      </div>
    </div>
  );
}
