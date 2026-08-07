export default function Slide12BusinessModel() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex"
      style={{ background: '#111111' }}
    >
      {/* Left — headline */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '40vw', paddingLeft: '7vw', paddingRight: '3vw', paddingTop: '8vh', paddingBottom: '8vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          Business Model
        </p>

        <h2
          className="font-display"
          style={{ fontSize: '5vw', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.01em', color: '#FAF6F2', marginBottom: '3.5vh', textWrap: 'balance' }}
        >
          How SeamXY makes money.
        </h2>

        <p
          className="font-body"
          style={{ fontSize: '1.8vw', lineHeight: 1.6, color: 'rgba(250,246,242,0.6)' }}
        >
          Multiple revenue streams aligned with how users actually engage with fashion — personal, social, and commercial.
        </p>
      </div>

      {/* Right — revenue streams */}
      <div
        className="flex flex-col justify-center"
        style={{ flex: 1, paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '8vh', gap: '1.8vh' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2vw',
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(250,246,242,0.1)',
            borderRadius: '0.8vw',
            padding: '2.2vh 2vw',
          }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.2vw', color: '#CC1519', width: '3vw', flexShrink: 0, lineHeight: 1 }}>01</p>
          <div>
            <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2', marginBottom: '0.4vh' }}>Subscriptions</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>Monthly and annual plans for individuals, groups, and businesses</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2vw',
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(250,246,242,0.1)',
            borderRadius: '0.8vw',
            padding: '2.2vh 2vw',
          }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.2vw', color: '#CC1519', width: '3vw', flexShrink: 0, lineHeight: 1 }}>02</p>
          <div>
            <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2', marginBottom: '0.4vh' }}>Commerce commissions</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>Revenue share on shoppable looks and affiliate conversions</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2vw',
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(250,246,242,0.1)',
            borderRadius: '0.8vw',
            padding: '2.2vh 2vw',
          }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.2vw', color: '#CC1519', width: '3vw', flexShrink: 0, lineHeight: 1 }}>03</p>
          <div>
            <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2', marginBottom: '0.4vh' }}>Brand partnerships</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>Style-native advertising and catalog integration for retailers</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2vw',
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(250,246,242,0.1)',
            borderRadius: '0.8vw',
            padding: '2.2vh 2vw',
          }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.2vw', color: '#CC1519', width: '3vw', flexShrink: 0, lineHeight: 1 }}>04</p>
          <div>
            <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2', marginBottom: '0.4vh' }}>Creator tools</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>Premium features and storefronts for professional stylists</p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2vw',
            background: 'rgba(204,21,25,0.08)',
            border: '1px solid rgba(204,21,25,0.25)',
            borderRadius: '0.8vw',
            padding: '2.2vh 2vw',
          }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.2vw', color: '#CC1519', width: '3vw', flexShrink: 0, lineHeight: 1 }}>05</p>
          <div>
            <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2', marginBottom: '0.4vh' }}>Enterprise API</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)' }}>Style intelligence and try-on infrastructure licensed to fashion platforms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
