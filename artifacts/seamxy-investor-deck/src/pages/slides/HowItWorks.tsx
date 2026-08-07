export default function HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary flex flex-col items-center justify-center" style={{ paddingLeft: '5vw', paddingRight: '5vw' }}>
      {/* Label */}
      <div className="flex items-center gap-[2vw] mb-[4vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>How It Works</p>
      </div>

      <h2
        className="font-display font-bold text-bg text-center mb-[7vh]"
        style={{ fontSize: '4.2vw', lineHeight: 1.05 }}
      >
        Four inputs. One intelligence.
      </h2>

      {/* Diagram row */}
      <div className="flex items-center w-full gap-[2vw]">
        {/* Inputs column */}
        <div className="flex flex-col gap-[2vh]" style={{ flex: '1' }}>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Closet</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>What you own</p>
          </div>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Body</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>Measurements + fit</p>
          </div>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Calendar</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>Occasion context</p>
          </div>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Taste</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>Style quiz profile</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center" style={{ width: '8vw' }}>
          <div className="bg-accent" style={{ height: '0.25vh', width: '6vw' }} />
          <div style={{ width: 0, height: 0, borderTop: '1.2vh solid transparent', borderBottom: '1.2vh solid transparent', borderLeft: '1.8vw solid #CC1519', marginLeft: '0.2vw' }} />
        </div>

        {/* AI Core */}
        <div
          className="flex flex-col items-center justify-center text-center rounded-[1.5vw]"
          style={{
            flex: '1.2',
            background: '#CC1519',
            padding: '5vh 2vw',
            minHeight: '35vh',
          }}
        >
          <p className="font-display font-bold text-bg mb-[1.5vh]" style={{ fontSize: '3vw' }}>SeamXY AI</p>
          <p className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.8)', lineHeight: 1.5 }}>Claude claude-opus-4-5</p>
          <p className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.8)', lineHeight: 1.5 }}>Tool Use API</p>
          <p className="font-body" style={{ fontSize: '1.45vw', color: 'rgba(250,249,246,0.8)', lineHeight: 1.5 }}>9 Stylist Personas</p>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center" style={{ width: '8vw' }}>
          <div className="bg-accent" style={{ height: '0.25vh', width: '6vw' }} />
          <div style={{ width: 0, height: 0, borderTop: '1.2vh solid transparent', borderBottom: '1.2vh solid transparent', borderLeft: '1.8vw solid #CC1519', marginLeft: '0.2vw' }} />
        </div>

        {/* Outputs column */}
        <div className="flex flex-col gap-[2vh]" style={{ flex: '1' }}>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Daily Outfit</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>Weather-aware picks</p>
          </div>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Shopping Recs</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>Fit-ranked products</p>
          </div>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Try-On Studio</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>See it before buying</p>
          </div>
          <div className="rounded-[0.8vw] text-center" style={{ background: 'rgba(250,249,246,0.08)', padding: '2vh 1.5vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.5vw' }}>Gap Analysis</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.6)', marginTop: '0.5vh' }}>What your closet needs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
