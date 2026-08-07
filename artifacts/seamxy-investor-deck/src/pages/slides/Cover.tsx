const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#111111' }}>
      {/* Hero image — right half */}
      <div className="absolute right-0 top-0 w-[55vw] h-full">
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
              'linear-gradient(to right, #111111 0%, rgba(204,21,25,0.88) 18%, rgba(204,21,25,0.35) 55%, transparent 100%)',
          }}
        />
      </div>

      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '20vh', background: 'linear-gradient(to top, #111111 0%, transparent 100%)' }}
      />

      {/* Left content */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-center" style={{ paddingLeft: '7vw', paddingRight: '4vw', width: '55vw' }}>
        {/* Crimson rule */}
        <div className="bg-accent mb-[3vh]" style={{ height: '0.3vh', width: '4vw' }} />

        {/* Label */}
        <p
          className="font-body text-accent uppercase tracking-widest mb-[2.5vh]"
          style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}
        >
          Investor Presentation · 2026
        </p>

        {/* Main headline */}
        <div className="mb-[4vh]">
          <h1
            className="font-display font-bold text-bg"
            style={{ fontSize: '8vw', lineHeight: 0.92, letterSpacing: '-0.01em' }}
          >
            Style,
          </h1>
          <h1
            className="font-display font-bold text-bg"
            style={{ fontSize: '8vw', lineHeight: 0.92, letterSpacing: '-0.01em' }}
          >
            sorted.
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="font-body mb-[2vh]"
          style={{ fontSize: '2vw', color: 'rgba(250,249,246,0.75)', lineHeight: 1.45 }}
        >
          The AI-powered personal style operating system.
        </p>
        <p
          className="font-body mb-[6vh]"
          style={{ fontSize: '2vw', color: 'rgba(250,249,246,0.75)', lineHeight: 1.45 }}
        >
          Closet, body, calendar, and taste — unified.
        </p>

        {/* Brand wordmark */}
        <p
          className="font-display font-semibold text-bg"
          style={{ fontSize: '2vw', letterSpacing: '0.15em' }}
        >
          SeamXY
        </p>
      </div>
    </div>
  );
}
