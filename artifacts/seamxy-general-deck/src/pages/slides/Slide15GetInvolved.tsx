export default function Slide15GetInvolved() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: '#111111' }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 100% 100%, rgba(204,21,25,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top crimson line */}
      <div style={{ height: '0.4vh', width: '100%', background: 'linear-gradient(to right, #CC1519 0%, rgba(204,21,25,0.3) 50%, transparent 100%)' }} />

      {/* Content */}
      <div
        className="flex flex-col justify-center flex-1"
        style={{ paddingLeft: '7vw', paddingRight: '7vw' }}
      >
        {/* Label */}
        <p
          className="font-body uppercase"
          style={{ fontSize: '1.1vw', letterSpacing: '0.28em', color: '#CC1519', marginBottom: '4vh' }}
        >
          Get Involved
        </p>

        {/* Main headline */}
        <h2
          className="font-display"
          style={{ fontSize: '6vw', lineHeight: 0.95, fontWeight: 300, letterSpacing: '-0.015em', color: '#FAF6F2', marginBottom: '6vh', textWrap: 'balance' }}
        >
          Style, sorted — for you.
        </h2>

        {/* Three pathways — no buttons, styled as text blocks */}
        <div className="flex gap-[5vw]">
          <div>
            <p
              className="font-body uppercase"
              style={{ fontSize: '1.1vw', letterSpacing: '0.2em', color: 'rgba(250,246,242,0.35)', marginBottom: '1.5vh' }}
            >
              Sign up
            </p>
            <p
              className="font-display"
              style={{ fontSize: '2.2vw', color: '#FAF6F2', fontStyle: 'italic', fontWeight: 400, marginBottom: '1vh' }}
            >
              Join the waitlist
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.5)', lineHeight: 1.5 }}>
              Be among the first to experience SeamXY. Early access opens soon.
            </p>
          </div>

          <div style={{ width: '0.1vw', background: 'rgba(250,246,242,0.1)' }} />

          <div>
            <p
              className="font-body uppercase"
              style={{ fontSize: '1.1vw', letterSpacing: '0.2em', color: 'rgba(250,246,242,0.35)', marginBottom: '1.5vh' }}
            >
              Partner
            </p>
            <p
              className="font-display"
              style={{ fontSize: '2.2vw', color: '#FAF6F2', fontStyle: 'italic', fontWeight: 400, marginBottom: '1vh' }}
            >
              Work with us
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.5)', lineHeight: 1.5 }}>
              Brands, retailers, and creators — let's build the future of style together.
            </p>
          </div>

          <div style={{ width: '0.1vw', background: 'rgba(250,246,242,0.1)' }} />

          <div>
            <p
              className="font-body uppercase"
              style={{ fontSize: '1.1vw', letterSpacing: '0.2em', color: 'rgba(250,246,242,0.35)', marginBottom: '1.5vh' }}
            >
              Follow
            </p>
            <p
              className="font-display"
              style={{ fontSize: '2.2vw', color: '#FAF6F2', fontStyle: 'italic', fontWeight: 400, marginBottom: '1vh' }}
            >
              Stay in the loop
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.5)', lineHeight: 1.5 }}>
              Follow our journey on social. Stories, launches, and styling inspiration every week.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom — brand wordmark */}
      <div
        className="flex items-center justify-between"
        style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingBottom: '5vh' }}
      >
        <p
          className="font-display font-semibold"
          style={{ fontSize: '2.2vw', letterSpacing: '0.18em', color: '#FAF6F2' }}
        >
          SeamXY
        </p>
        <p
          className="font-body"
          style={{ fontSize: '1.3vw', color: 'rgba(250,246,242,0.3)', letterSpacing: '0.05em' }}
        >
          seamxy.com
        </p>
      </div>
    </div>
  );
}
