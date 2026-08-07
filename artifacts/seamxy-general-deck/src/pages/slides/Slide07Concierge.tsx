export default function Slide07Concierge() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#111111' }}
    >
      {/* Background glow */}
      <div
        className="absolute"
        style={{
          top: '-10%',
          right: '-5%',
          width: '55vw',
          height: '120vh',
          background: 'radial-gradient(ellipse at top right, rgba(204,21,25,0.10) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left — label + headline */}
      <div
        className="absolute flex flex-col justify-center h-full"
        style={{ left: '7vw', width: '42vw', paddingTop: '8vh', paddingBottom: '8vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          AI Concierge
        </p>

        <h2
          className="font-display"
          style={{ fontSize: '5vw', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.01em', color: '#FAF6F2', marginBottom: '3.5vh', textWrap: 'balance' }}
        >
          Ask what to wear. Get a styled answer.
        </h2>

        <p
          className="font-body"
          style={{ fontSize: '1.8vw', lineHeight: 1.6, color: 'rgba(250,246,242,0.6)', marginBottom: '4vh' }}
        >
          An always-available styling advisor that knows everything in your wardrobe. Ask it anything. It answers in seconds.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
          <p className="font-body" style={{ fontSize: '1.6vw', color: 'rgba(250,246,242,0.85)', lineHeight: 1.5 }}>
            — What should I wear for a job interview?
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', color: 'rgba(250,246,242,0.85)', lineHeight: 1.5 }}>
            — Style me for 15-degree weather
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', color: 'rgba(250,246,242,0.85)', lineHeight: 1.5 }}>
            — Give me three outfits for my Paris trip
          </p>
        </div>
      </div>

      {/* Right — conversation UI */}
      <div
        className="absolute flex flex-col justify-center"
        style={{ right: '7vw', top: '8vh', bottom: '8vh', width: '40vw', gap: '2vh' }}
      >
        {/* User message */}
        <div className="flex justify-end">
          <div
            style={{
              background: '#CC1519',
              borderRadius: '1.2vw 1.2vw 0.2vw 1.2vw',
              padding: '2vh 2vw',
              maxWidth: '85%',
            }}
          >
            <p className="font-body" style={{ fontSize: '1.5vw', color: '#FAF6F2', lineHeight: 1.5 }}>
              I have a gallery opening tonight. What should I wear?
            </p>
          </div>
        </div>

        {/* AI response */}
        <div className="flex justify-start">
          <div
            style={{
              background: 'rgba(250,246,242,0.06)',
              border: '1px solid rgba(250,246,242,0.12)',
              borderRadius: '1.2vw 1.2vw 1.2vw 0.2vw',
              padding: '2.5vh 2vw',
              maxWidth: '100%',
            }}
          >
            <p className="font-body font-semibold" style={{ fontSize: '1.3vw', color: '#CC1519', marginBottom: '1.2vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Concierge
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.85)', lineHeight: 1.6 }}>
              Perfect occasion for your emerald wrap dress — worn twice, still fresh. Pair with your black ankle boots and the gold drop earrings from last November.
            </p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.5)', marginTop: '1.5vh', lineHeight: 1.5 }}>
              Confidence score: 94% — based on your style profile and occasion history.
            </p>
          </div>
        </div>

        {/* Second user */}
        <div className="flex justify-end">
          <div
            style={{
              background: 'rgba(204,21,25,0.4)',
              border: '1px solid rgba(204,21,25,0.3)',
              borderRadius: '1.2vw 1.2vw 0.2vw 1.2vw',
              padding: '2vh 2vw',
              maxWidth: '75%',
            }}
          >
            <p className="font-body" style={{ fontSize: '1.5vw', color: '#FAF6F2', lineHeight: 1.5 }}>
              Can I wear something more unexpected?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
