export default function Slide05TheSystem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex"
      style={{ background: '#111111' }}
    >
      {/* Left — headline block */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '42vw', paddingLeft: '7vw', paddingRight: '3vw', paddingTop: '8vh', paddingBottom: '7vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          The System
        </p>
        <h2
          className="font-display"
          style={{ fontSize: '4.8vw', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#FAF6F2', fontWeight: 300, marginBottom: '3.5vh', textWrap: 'balance' }}
        >
          Four inputs. One intelligence.
        </h2>
        <p
          className="font-body"
          style={{ fontSize: '1.8vw', lineHeight: 1.6, color: 'rgba(250,246,242,0.6)', marginBottom: '5vh' }}
        >
          SeamXY connects the signals that matter — your closet, your body, your taste, your calendar — into a single style layer that actually knows you.
        </p>

        {/* Output statement */}
        <div
          style={{ borderLeft: '0.3vw solid #CC1519', paddingLeft: '2vw' }}
        >
          <p className="font-display font-semibold" style={{ fontSize: '2.2vw', color: '#FAF6F2', lineHeight: 1.3 }}>
            The result: you always know what to wear.
          </p>
        </div>
      </div>

      {/* Right — four inputs grid */}
      <div
        className="flex flex-col justify-center"
        style={{ flex: 1, paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh', gap: '2.5vh' }}
      >
        {/* Row 1 */}
        <div className="flex gap-[2vw]">
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'rgba(250,246,242,0.05)', borderRadius: '1vw', padding: '3vh 2.5vw', border: '1px solid rgba(250,246,242,0.1)' }}
          >
            <p className="font-display font-semibold" style={{ fontSize: '2.5vw', color: '#CC1519', marginBottom: '1.5vh' }}>Closet</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.65)', lineHeight: 1.5 }}>
              Every piece catalogued and tagged — by color, occasion, season, and fit.
            </p>
          </div>
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'rgba(250,246,242,0.05)', borderRadius: '1vw', padding: '3vh 2.5vw', border: '1px solid rgba(250,246,242,0.1)' }}
          >
            <p className="font-display font-semibold" style={{ fontSize: '2.5vw', color: '#CC1519', marginBottom: '1.5vh' }}>Body</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.65)', lineHeight: 1.5 }}>
              Your measurements and proportions, so every suggestion fits the way it should.
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex gap-[2vw]">
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'rgba(250,246,242,0.05)', borderRadius: '1vw', padding: '3vh 2.5vw', border: '1px solid rgba(250,246,242,0.1)' }}
          >
            <p className="font-display font-semibold" style={{ fontSize: '2.5vw', color: '#CC1519', marginBottom: '1.5vh' }}>Taste</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.65)', lineHeight: 1.5 }}>
              A style profile that learns from your choices and refines over time.
            </p>
          </div>
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'rgba(250,246,242,0.05)', borderRadius: '1vw', padding: '3vh 2.5vw', border: '1px solid rgba(250,246,242,0.1)' }}
          >
            <p className="font-display font-semibold" style={{ fontSize: '2.5vw', color: '#CC1519', marginBottom: '1.5vh' }}>Calendar</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.65)', lineHeight: 1.5 }}>
              Context-aware outfits matched to where you're going and what you're doing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
