export default function Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary flex" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Left: big headline */}
      <div className="flex flex-col justify-center" style={{ width: '44vw', paddingRight: '5vw' }}>
        <div className="flex items-center gap-[2vw] mb-[4vh]">
          <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
          <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>The Solution</p>
        </div>
        <h2
          className="font-display font-bold text-bg mb-[4vh]"
          style={{ fontSize: '5.2vw', lineHeight: 1.0, letterSpacing: '-0.01em' }}
        >
          The personal style operating system.
        </h2>
        <p className="font-body" style={{ fontSize: '2vw', color: 'rgba(250,249,246,0.72)', lineHeight: 1.55 }}>
          SeamXY connects closet, body, calendar, and taste into a single AI layer that tells you what to wear — and helps you shop, fit, and share smarter.
        </p>
      </div>

      {/* Right: four pillars */}
      <div className="flex flex-col justify-center flex-1 gap-[2.2vh]">
        {/* Pillar 1 */}
        <div className="rounded-[0.8vw] flex items-center gap-[2vw]" style={{ background: 'rgba(250,249,246,0.07)', padding: '2.2vh 2vw', borderLeft: '0.3vw solid #CC1519' }}>
          <div>
            <p className="font-body font-semibold text-bg mb-[0.5vh]" style={{ fontSize: '1.6vw' }}>Find Your Look</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,249,246,0.65)' }}>Situational AI styling for any occasion — no account needed</p>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-[0.8vw] flex items-center gap-[2vw]" style={{ background: 'rgba(250,249,246,0.07)', padding: '2.2vh 2vw', borderLeft: '0.3vw solid #CC1519' }}>
          <div>
            <p className="font-body font-semibold text-bg mb-[0.5vh]" style={{ fontSize: '1.6vw' }}>AI Concierge</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,249,246,0.65)' }}>Claude-powered styling conversations with 9 stylist personas</p>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="rounded-[0.8vw] flex items-center gap-[2vw]" style={{ background: 'rgba(250,249,246,0.07)', padding: '2.2vh 2vw', borderLeft: '0.3vw solid #CC1519' }}>
          <div>
            <p className="font-body font-semibold text-bg mb-[0.5vh]" style={{ fontSize: '1.6vw' }}>Virtual Try-On</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,249,246,0.65)' }}>MediaPipe pose detection + TPS warping + live AR mode</p>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="rounded-[0.8vw] flex items-center gap-[2vw]" style={{ background: 'rgba(250,249,246,0.07)', padding: '2.2vh 2vw', borderLeft: '0.3vw solid #CC1519' }}>
          <div>
            <p className="font-body font-semibold text-bg mb-[0.5vh]" style={{ fontSize: '1.6vw' }}>Closet OS + Dashboard</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,249,246,0.65)' }}>Daily AI outfit, wardrobe gap analysis, smart shopping integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
