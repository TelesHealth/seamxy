export default function GoToMarket() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>Go-to-Market</p>
      </div>

      <h2
        className="font-display font-bold text-bg mb-[6vh]"
        style={{ fontSize: '4vw', lineHeight: 1.05 }}
      >
        Guest-first. Quiz-to-member. Creator-led.
      </h2>

      {/* Funnel steps */}
      <div className="flex gap-0 flex-1">
        {/* Step 1 */}
        <div className="flex flex-col flex-1" style={{ borderTop: '0.4vh solid rgba(250,249,246,0.2)', paddingTop: '3vh' }}>
          <p className="font-body text-muted mb-[2vh]" style={{ fontSize: '1.2vw', letterSpacing: '0.15em' }}>STAGE 01</p>
          <p className="font-display font-bold text-bg mb-[2vh]" style={{ fontSize: '2.5vw', lineHeight: 1.1 }}>Guest discovery</p>
          <p className="font-body mb-[3vh]" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.7)', lineHeight: 1.6 }}>
            Find Look and Inspo require zero sign-up. Visitors get real AI styling immediately — lowering the barrier to first value.
          </p>
          <div className="rounded-[0.8vw] mt-auto" style={{ background: 'rgba(250,249,246,0.08)', padding: '1.8vh 1.5vw' }}>
            <p className="font-body text-bg" style={{ fontSize: '1.35vw' }}>Hook: AI outfit in 60 seconds</p>
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center" style={{ width: '3vw', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '0.15vh', background: '#2236E8' }} />
          <div style={{ width: 0, height: 0, borderTop: '0.8vh solid transparent', borderBottom: '0.8vh solid transparent', borderLeft: '1.2vw solid #2236E8' }} />
        </div>

        {/* Step 2 */}
        <div className="flex flex-col flex-1" style={{ borderTop: '0.4vh solid #2236E8', paddingTop: '3vh' }}>
          <p className="font-body text-accent mb-[2vh]" style={{ fontSize: '1.2vw', letterSpacing: '0.15em' }}>STAGE 02</p>
          <p className="font-display font-bold text-bg mb-[2vh]" style={{ fontSize: '2.5vw', lineHeight: 1.1 }}>Quiz activation</p>
          <p className="font-body mb-[3vh]" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.7)', lineHeight: 1.6 }}>
            5-minute style quiz builds a persistent taste profile — feeding every future recommendation and creating the data lock-in.
          </p>
          <div className="rounded-[0.8vw] mt-auto" style={{ background: 'rgba(34,54,232,0.25)', padding: '1.8vh 1.5vw' }}>
            <p className="font-body text-bg" style={{ fontSize: '1.35vw' }}>Convert: quiz completion = account creation</p>
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center" style={{ width: '3vw', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '0.15vh', background: '#2236E8' }} />
          <div style={{ width: 0, height: 0, borderTop: '0.8vh solid transparent', borderBottom: '0.8vh solid transparent', borderLeft: '1.2vw solid #2236E8' }} />
        </div>

        {/* Step 3 */}
        <div className="flex flex-col flex-1" style={{ borderTop: '0.4vh solid rgba(250,249,246,0.4)', paddingTop: '3vh' }}>
          <p className="font-body text-muted mb-[2vh]" style={{ fontSize: '1.2vw', letterSpacing: '0.15em' }}>STAGE 03</p>
          <p className="font-display font-bold text-bg mb-[2vh]" style={{ fontSize: '2.5vw', lineHeight: 1.1 }}>Member deepening</p>
          <p className="font-body mb-[3vh]" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.7)', lineHeight: 1.6 }}>
            Dashboard, Closet, and Try-On create daily habits. Each interaction improves the model and raises switching costs.
          </p>
          <div className="rounded-[0.8vw] mt-auto" style={{ background: 'rgba(250,249,246,0.08)', padding: '1.8vh 1.5vw' }}>
            <p className="font-body text-bg" style={{ fontSize: '1.35vw' }}>Retain: daily outfit builds the habit</p>
          </div>
        </div>

        {/* Connector */}
        <div className="flex items-center" style={{ width: '3vw', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '0.15vh', background: '#2236E8' }} />
          <div style={{ width: 0, height: 0, borderTop: '0.8vh solid transparent', borderBottom: '0.8vh solid transparent', borderLeft: '1.2vw solid #2236E8' }} />
        </div>

        {/* Step 4 */}
        <div className="flex flex-col flex-1" style={{ borderTop: '0.4vh solid rgba(250,249,246,0.2)', paddingTop: '3vh' }}>
          <p className="font-body text-muted mb-[2vh]" style={{ fontSize: '1.2vw', letterSpacing: '0.15em' }}>STAGE 04</p>
          <p className="font-display font-bold text-bg mb-[2vh]" style={{ fontSize: '2.5vw', lineHeight: 1.1 }}>Pro conversion</p>
          <p className="font-body mb-[3vh]" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.7)', lineHeight: 1.6 }}>
            Creator ecosystem drives organic referrals. Stylists bring their audiences. Group features drive viral member growth.
          </p>
          <div className="rounded-[0.8vw] mt-auto" style={{ background: 'rgba(250,249,246,0.08)', padding: '1.8vh 1.5vw' }}>
            <p className="font-body text-bg" style={{ fontSize: '1.35vw' }}>Monetize: Pro + affiliates + gig</p>
          </div>
        </div>
      </div>
    </div>
  );
}
