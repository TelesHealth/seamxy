export default function Slide14Vision() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#111111' }}
    >
      {/* Large background text — decorative */}
      <div
        className="absolute"
        style={{
          bottom: '-4vh',
          right: '-2vw',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <p
          className="font-display font-bold"
          style={{
            fontSize: '28vw',
            lineHeight: 0.85,
            color: 'rgba(250,246,242,0.03)',
            letterSpacing: '-0.03em',
          }}
        >
          2030
        </p>
      </div>

      {/* Top accent */}
      <div
        className="absolute top-0 right-0"
        style={{
          width: '30vw',
          height: '0.4vh',
          background: 'linear-gradient(to left, #CC1519 0%, transparent 100%)',
        }}
      />

      {/* Main content */}
      <div
        className="absolute flex flex-col justify-center h-full"
        style={{ left: '7vw', right: '7vw', paddingTop: '8vh', paddingBottom: '8vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          Where It's Going
        </p>

        <h2
          className="font-display"
          style={{ fontSize: '5.5vw', lineHeight: 1.0, fontWeight: 300, letterSpacing: '-0.015em', color: '#FAF6F2', marginBottom: '5vh', maxWidth: '72vw', textWrap: 'balance' }}
        >
          The style layer for how people dress — everywhere, every day.
        </h2>

        {/* Three vision pillars */}
        <div className="flex gap-[4vw]">
          <div style={{ flex: 1 }}>
            <div style={{ height: '0.3vh', background: '#CC1519', marginBottom: '2.5vh' }} />
            <p className="font-body font-semibold" style={{ fontSize: '1.7vw', color: '#FAF6F2', marginBottom: '1.2vh' }}>Global wardrobe OS</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.55)', lineHeight: 1.55 }}>
              Every person, every closet — a personal style intelligence that travels with you for life.
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ height: '0.3vh', background: 'rgba(250,246,242,0.2)', marginBottom: '2.5vh' }} />
            <p className="font-body font-semibold" style={{ fontSize: '1.7vw', color: '#FAF6F2', marginBottom: '1.2vh' }}>Fashion's data layer</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.55)', lineHeight: 1.55 }}>
              The platform that connects consumer behavior to supply chains, reducing waste and improving production.
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ height: '0.3vh', background: 'rgba(250,246,242,0.2)', marginBottom: '2.5vh' }} />
            <p className="font-body font-semibold" style={{ fontSize: '1.7vw', color: '#FAF6F2', marginBottom: '1.2vh' }}>The social graph for style</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.55)', lineHeight: 1.55 }}>
              A network where creators, makers, and consumers share the same intelligence layer and grow together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
