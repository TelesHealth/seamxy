const base = import.meta.env.BASE_URL;

export default function Slide01Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#111111' }}>
      {/* Hero image — right portion */}
      <div className="absolute right-0 top-0 w-[58vw] h-full">
        <img
          src={`${base}cover-hero.jpg`}
          crossOrigin="anonymous"
          className="w-full h-full object-cover"
          alt=""
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #111111 0%, rgba(17,17,17,0.85) 15%, rgba(17,17,17,0.3) 55%, transparent 100%)',
          }}
        />
      </div>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '18vh', background: 'linear-gradient(to top, #111111 0%, transparent 100%)' }}
      />

      {/* Left content */}
      <div
        className="absolute left-0 top-0 h-full flex flex-col justify-center"
        style={{ paddingLeft: '7vw', paddingRight: '4vw', width: '52vw' }}
      >
        {/* Crimson rule */}
        <div style={{ height: '0.3vh', width: '3.5vw', background: '#CC1519', marginBottom: '3vh' }} />

        {/* Label */}
        <p
          className="font-body uppercase"
          style={{ fontSize: '1.1vw', letterSpacing: '0.28em', color: '#CC1519', marginBottom: '3vh' }}
        >
          An Overview · 2026
        </p>

        {/* Main headline */}
        <div style={{ marginBottom: '4vh' }}>
          <h1
            className="font-display font-bold"
            style={{ fontSize: '8.5vw', lineHeight: 0.9, letterSpacing: '-0.01em', color: '#FAF6F2' }}
          >
            Style,
          </h1>
          <h1
            className="font-display font-bold"
            style={{ fontSize: '8.5vw', lineHeight: 0.9, letterSpacing: '-0.01em', color: '#FAF6F2' }}
          >
            sorted.
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="font-body"
          style={{ fontSize: '1.9vw', color: 'rgba(250,246,242,0.72)', lineHeight: 1.5, marginBottom: '1.5vh' }}
        >
          The personal style OS.
        </p>
        <p
          className="font-body"
          style={{ fontSize: '1.9vw', color: 'rgba(250,246,242,0.72)', lineHeight: 1.5, marginBottom: '7vh' }}
        >
          AI meets your wardrobe.
        </p>

        {/* Brand wordmark */}
        <p
          className="font-display font-semibold"
          style={{ fontSize: '1.8vw', letterSpacing: '0.18em', color: '#FAF6F2' }}
        >
          SeamXY
        </p>
      </div>
    </div>
  );
}
