export default function TheAsk() {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex" style={{ background: '#111111' }}>
      {/* Left: closing brand */}
      <div
        className="flex flex-col justify-between"
        style={{ width: '42vw', padding: '9vh 5vw 9vh 7vw', borderRight: '0.1vw solid rgba(250,249,246,0.12)' }}
      >
        {/* Top */}
        <div>
          <div className="bg-accent mb-[3vh]" style={{ height: '0.3vh', width: '4vw' }} />
          <p className="font-body text-accent uppercase tracking-widest mb-[4vh]" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>The Ask</p>
          <h2
            className="font-display font-bold text-bg"
            style={{ fontSize: '6vw', lineHeight: 0.95, letterSpacing: '-0.01em' }}
          >
            Ready to
          </h2>
          <h2
            className="font-display font-bold text-bg mb-[5vh]"
            style={{ fontSize: '6vw', lineHeight: 0.95, letterSpacing: '-0.01em' }}
          >
            scale.
          </h2>
          <p className="font-body" style={{ fontSize: '1.8vw', color: 'rgba(250,249,246,0.72)', lineHeight: 1.55 }}>
            The platform is built. The intelligence is live. We are raising to scale distribution, grow the creator ecosystem, and expand into new markets.
          </p>
        </div>

        {/* Bottom wordmark */}
        <p className="font-display font-semibold text-bg" style={{ fontSize: '2vw', letterSpacing: '0.15em' }}>SeamXY</p>
      </div>

      {/* Right: use of funds */}
      <div
        className="flex flex-col justify-center"
        style={{ flex: 1, padding: '9vh 7vw 9vh 5vw' }}
      >
        <p className="font-body font-semibold text-muted uppercase tracking-widest mb-[4vh]" style={{ fontSize: '1.1vw', letterSpacing: '0.2em' }}>Use of Funds</p>

        <div className="flex flex-col gap-[3vh]">
          {/* Item 1 */}
          <div style={{ borderLeft: '0.35vw solid #CC1519', paddingLeft: '1.8vw' }}>
            <div className="flex justify-between items-baseline mb-[0.8vh]">
              <p className="font-body font-semibold text-bg" style={{ fontSize: '1.6vw' }}>Growth & Distribution</p>
              <p className="font-display font-bold text-accent" style={{ fontSize: '2.2vw' }}>40%</p>
            </div>
            <p className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(250,249,246,0.6)', lineHeight: 1.45 }}>Performance marketing, creator partnership program, brand partnerships, and market expansion</p>
          </div>

          {/* Item 2 */}
          <div style={{ borderLeft: '0.35vw solid rgba(250,249,246,0.35)', paddingLeft: '1.8vw' }}>
            <div className="flex justify-between items-baseline mb-[0.8vh]">
              <p className="font-body font-semibold text-bg" style={{ fontSize: '1.6vw' }}>Product & Engineering</p>
              <p className="font-display font-bold text-bg" style={{ fontSize: '2.2vw' }}>35%</p>
            </div>
            <p className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(250,249,246,0.6)', lineHeight: 1.45 }}>AI model improvements, mobile apps, supplier integrations, and platform scale infrastructure</p>
          </div>

          {/* Item 3 */}
          <div style={{ borderLeft: '0.35vw solid rgba(250,249,246,0.35)', paddingLeft: '1.8vw' }}>
            <div className="flex justify-between items-baseline mb-[0.8vh]">
              <p className="font-body font-semibold text-bg" style={{ fontSize: '1.6vw' }}>Team Expansion</p>
              <p className="font-display font-bold text-bg" style={{ fontSize: '2.2vw' }}>15%</p>
            </div>
            <p className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(250,249,246,0.6)', lineHeight: 1.45 }}>Sales, customer success, and fashion industry partnerships</p>
          </div>

          {/* Item 4 */}
          <div style={{ borderLeft: '0.35vw solid rgba(250,249,246,0.35)', paddingLeft: '1.8vw' }}>
            <div className="flex justify-between items-baseline mb-[0.8vh]">
              <p className="font-body font-semibold text-bg" style={{ fontSize: '1.6vw' }}>Operations & Reserve</p>
              <p className="font-display font-bold text-bg" style={{ fontSize: '2.2vw' }}>10%</p>
            </div>
            <p className="font-body" style={{ fontSize: '1.35vw', color: 'rgba(250,249,246,0.6)', lineHeight: 1.45 }}>Legal, compliance, and 12-month operating reserve</p>
          </div>
        </div>
      </div>
    </div>
  );
}
