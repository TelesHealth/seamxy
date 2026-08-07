export default function Slide02Problem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col seamxy-bg"
      style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
    >
      {/* Top label */}
      <div className="flex items-center gap-[2vw]" style={{ marginBottom: '4vh' }}>
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519' }}>
          The Problem
        </p>
      </div>

      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '5vw', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#111111', maxWidth: '62vw', marginBottom: '6vh', textWrap: 'balance' }}
      >
        Getting dressed shouldn't be this hard.
      </h2>

      {/* Three problem cards */}
      <div className="flex gap-[2.5vw] flex-1">
        {/* Card 1 */}
        <div
          className="flex-1 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.65)', borderRadius: '1vw', padding: '3.5vh 2.5vw', border: '1px solid rgba(17,17,17,0.08)' }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: '3.8vw', lineHeight: 1.0, color: '#CC1519', marginBottom: '1.5vh' }}
          >
            80%
          </p>
          <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#111111', marginBottom: '1.5vh' }}>
            of your closet sits unworn
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.55, color: '#6B5F5A' }}>
            Most people cycle through the same handful of pieces. The rest is invisible, forgotten, and wasted.
          </p>
        </div>

        {/* Card 2 */}
        <div
          className="flex-1 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.65)', borderRadius: '1vw', padding: '3.5vh 2.5vw', border: '1px solid rgba(17,17,17,0.08)' }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: '3.8vw', lineHeight: 1.0, color: '#CC1519', marginBottom: '1.5vh' }}
          >
            Zero
          </p>
          <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#111111', marginBottom: '1.5vh' }}>
            intelligence connecting the dots
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.55, color: '#6B5F5A' }}>
            Shopping, styling, and social inspiration live in separate worlds with no shared memory between them.
          </p>
        </div>

        {/* Card 3 — dark */}
        <div
          className="flex-1 flex flex-col"
          style={{ background: '#111111', borderRadius: '1vw', padding: '3.5vh 2.5vw' }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: '3.8vw', lineHeight: 1.0, color: '#CC1519', marginBottom: '1.5vh' }}
          >
            Daily
          </p>
          <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2', marginBottom: '1.5vh' }}>
            decision fatigue at the wardrobe
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.55, color: 'rgba(250,246,242,0.65)' }}>
            Most closets are full. Most outfits are the same. The problem isn't having clothes — it's having no system.
          </p>
        </div>
      </div>
    </div>
  );
}
