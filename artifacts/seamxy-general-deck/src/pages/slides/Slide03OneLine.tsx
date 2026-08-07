export default function Slide03OneLine() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: '#111111' }}
    >
      {/* Subtle crimson accent bar — left edge */}
      <div
        className="absolute left-0 top-0 h-full"
        style={{ width: '0.5vw', background: 'linear-gradient(to bottom, #CC1519 0%, rgba(204,21,25,0.15) 100%)' }}
      />

      {/* Soft background glow */}
      <div
        className="absolute"
        style={{
          top: '20%',
          left: '10%',
          width: '50vw',
          height: '60vh',
          background: 'radial-gradient(ellipse at center, rgba(204,21,25,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content — vertically centered */}
      <div
        className="flex flex-col justify-center h-full"
        style={{ paddingLeft: '10vw', paddingRight: '10vw' }}
      >
        {/* Label */}
        <p
          className="font-body uppercase"
          style={{ fontSize: '1.1vw', letterSpacing: '0.28em', color: '#CC1519', marginBottom: '4vh' }}
        >
          SeamXY in one line
        </p>

        {/* Primary statement */}
        <h2
          className="font-display"
          style={{ fontSize: '6.5vw', lineHeight: 1.0, letterSpacing: '-0.015em', color: '#FAF6F2', fontWeight: 300, marginBottom: '2.5vh', textWrap: 'balance' }}
        >
          The personal style OS.
        </h2>

        {/* Secondary statement — italic */}
        <h3
          className="font-display"
          style={{ fontSize: '4.5vw', lineHeight: 1.1, letterSpacing: '-0.01em', color: '#CC1519', fontStyle: 'italic', fontWeight: 400, marginBottom: '6vh', textWrap: 'balance' }}
        >
          AI meets your wardrobe.
        </h3>

        {/* Divider */}
        <div style={{ height: '0.2vh', width: '5vw', background: 'rgba(250,246,242,0.25)', marginBottom: '4vh' }} />

        {/* Supporting line */}
        <p
          className="font-body"
          style={{ fontSize: '2vw', lineHeight: 1.55, color: 'rgba(250,246,242,0.6)', maxWidth: '55vw' }}
        >
          One platform that knows your closet, reads the moment,
          and tells you exactly what to wear.
        </p>
      </div>

      {/* Bottom brand mark */}
      <div
        className="absolute bottom-0 right-0"
        style={{ paddingRight: '7vw', paddingBottom: '5vh' }}
      >
        <p
          className="font-display font-semibold"
          style={{ fontSize: '1.6vw', letterSpacing: '0.18em', color: 'rgba(250,246,242,0.3)' }}
        >
          SeamXY
        </p>
      </div>
    </div>
  );
}
