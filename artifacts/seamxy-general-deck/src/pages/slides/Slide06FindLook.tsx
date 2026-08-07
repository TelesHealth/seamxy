export default function Slide06FindLook() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex seamxy-bg"
    >
      {/* Left content */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '48vw', paddingLeft: '7vw', paddingRight: '4vw', paddingTop: '8vh', paddingBottom: '7vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          Find Look
        </p>

        <h2
          className="font-display font-bold"
          style={{ fontSize: '5vw', lineHeight: 1.0, letterSpacing: '-0.015em', color: '#111111', marginBottom: '3.5vh', textWrap: 'balance' }}
        >
          Situational styling for any moment.
        </h2>

        <p
          className="font-body"
          style={{ fontSize: '1.9vw', lineHeight: 1.6, color: '#6B5F5A', marginBottom: '4.5vh' }}
        >
          Tell SeamXY where you're going. Get a complete, styled outfit built from what you actually own.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
          <div className="flex items-start gap-[1.2vw]">
            <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#CC1519', marginTop: '0.9vh', flexShrink: 0 }} />
            <p className="font-body" style={{ fontSize: '1.7vw', color: '#111111', lineHeight: 1.5 }}>
              Date night in the city
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#CC1519', marginTop: '0.9vh', flexShrink: 0 }} />
            <p className="font-body" style={{ fontSize: '1.7vw', color: '#111111', lineHeight: 1.5 }}>
              Board meeting at 9am
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#CC1519', marginTop: '0.9vh', flexShrink: 0 }} />
            <p className="font-body" style={{ fontSize: '1.7vw', color: '#111111', lineHeight: 1.5 }}>
              Weekend brunch, outdoor patio
            </p>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#CC1519', marginTop: '0.9vh', flexShrink: 0 }} />
            <p className="font-body" style={{ fontSize: '1.7vw', color: '#111111', lineHeight: 1.5 }}>
              Anything in between
            </p>
          </div>
        </div>
      </div>

      {/* Right — visual panel */}
      <div
        className="flex flex-col justify-center"
        style={{ flex: 1, paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
      >
        {/* Mock UI card */}
        <div
          style={{
            background: '#111111',
            borderRadius: '1.5vw',
            padding: '4vh 3vw',
            width: '100%',
          }}
        >
          <p
            className="font-body uppercase"
            style={{ fontSize: '1.1vw', letterSpacing: '0.2em', color: '#CC1519', marginBottom: '2.5vh' }}
          >
            Suggested for Tonight
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
            <div style={{ borderBottom: '1px solid rgba(250,246,242,0.1)', paddingBottom: '1.8vh' }}>
              <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2' }}>Black tailored blazer</p>
              <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>In your closet — last worn Oct 14</p>
            </div>
            <div style={{ borderBottom: '1px solid rgba(250,246,242,0.1)', paddingBottom: '1.8vh' }}>
              <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2' }}>Cream silk blouse</p>
              <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>In your closet — never worn</p>
            </div>
            <div style={{ borderBottom: '1px solid rgba(250,246,242,0.1)', paddingBottom: '1.8vh' }}>
              <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2' }}>Wide-leg trousers, charcoal</p>
              <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>In your closet — good condition</p>
            </div>
            <div>
              <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#CC1519' }}>Pointed toe heels — consider shopping</p>
              <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>Matches 12 pieces in your closet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
