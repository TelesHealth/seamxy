export default function Slide08TryOn() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex seamxy-bg"
    >
      {/* Left — text content */}
      <div
        className="flex flex-col justify-center"
        style={{ width: '48vw', paddingLeft: '7vw', paddingRight: '4vw', paddingTop: '8vh', paddingBottom: '7vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          Virtual Try-On
        </p>

        <h2
          className="font-display font-bold"
          style={{ fontSize: '5vw', lineHeight: 1.0, letterSpacing: '-0.015em', color: '#111111', marginBottom: '3.5vh', textWrap: 'balance' }}
        >
          See it on you before you own it.
        </h2>

        <p
          className="font-body"
          style={{ fontSize: '1.9vw', lineHeight: 1.6, color: '#6B5F5A', marginBottom: '4.5vh' }}
        >
          Upload a photo. Browse a piece. See exactly how it looks on your body — not a model, not a mannequin. You.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5vh' }}>
          <div style={{ borderLeft: '0.3vw solid #CC1519', paddingLeft: '2vw' }}>
            <p className="font-body font-semibold" style={{ fontSize: '1.7vw', color: '#111111', marginBottom: '0.5vh' }}>Powered by pose detection</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.5 }}>Intelligent body mapping adapts to your proportions, not a sample size.</p>
          </div>
          <div style={{ borderLeft: '0.3vw solid rgba(17,17,17,0.2)', paddingLeft: '2vw' }}>
            <p className="font-body font-semibold" style={{ fontSize: '1.7vw', color: '#111111', marginBottom: '0.5vh' }}>Shop with confidence</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.5 }}>Know before you buy. Reduce returns and buyer's remorse.</p>
          </div>
          <div style={{ borderLeft: '0.3vw solid rgba(17,17,17,0.2)', paddingLeft: '2vw' }}>
            <p className="font-body font-semibold" style={{ fontSize: '1.7vw', color: '#111111', marginBottom: '0.5vh' }}>Try your own closet too</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.5 }}>Revisit pieces you forgot you owned. Experiment with new combinations.</p>
          </div>
        </div>
      </div>

      {/* Right — visual panel */}
      <div
        className="flex items-center justify-center"
        style={{ flex: 1, paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
      >
        <div
          style={{
            background: '#111111',
            borderRadius: '1.5vw',
            padding: '4vh 3vw',
            width: '100%',
          }}
        >
          <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.2em', color: '#CC1519', marginBottom: '2.5vh' }}>
            Try-On Preview
          </p>

          {/* Simulated before/after */}
          <div className="flex gap-[2vw]">
            <div
              style={{
                flex: 1,
                aspectRatio: '3/4',
                background: 'rgba(250,246,242,0.06)',
                borderRadius: '0.8vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(250,246,242,0.12)',
                padding: '2vh 1.5vw',
              }}
            >
              <p className="font-display" style={{ fontSize: '2.5vw', color: 'rgba(250,246,242,0.2)', marginBottom: '1vh', fontStyle: 'italic' }}>Original</p>
              <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,246,242,0.35)', textAlign: 'center' }}>Your photo</p>
            </div>
            <div
              style={{
                flex: 1,
                aspectRatio: '3/4',
                background: 'rgba(204,21,25,0.08)',
                borderRadius: '0.8vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(204,21,25,0.25)',
                padding: '2vh 1.5vw',
              }}
            >
              <p className="font-display" style={{ fontSize: '2.5vw', color: '#CC1519', marginBottom: '1vh', fontStyle: 'italic' }}>With Piece</p>
              <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,246,242,0.35)', textAlign: 'center' }}>AI-rendered on you</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
