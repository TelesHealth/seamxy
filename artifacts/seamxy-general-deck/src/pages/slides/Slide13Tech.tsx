export default function Slide13Tech() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col seamxy-bg"
      style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
    >
      {/* Top label */}
      <div className="flex items-center gap-[2vw]" style={{ marginBottom: '3.5vh' }}>
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519' }}>
          Tech at a Glance
        </p>
      </div>

      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#111111', marginBottom: '1.5vh' }}
      >
        Built to last. Designed to scale.
      </h2>
      <p
        className="font-body"
        style={{ fontSize: '1.8vw', color: '#6B5F5A', marginBottom: '5vh' }}
      >
        Production-grade from day one — without the jargon.
      </p>

      {/* Four tech cards */}
      <div className="flex gap-[2.5vw] flex-1">
        {/* AI */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: '#111111',
            borderRadius: '1vw',
            padding: '3vh 2.5vw',
          }}
        >
          <p
            className="font-body uppercase"
            style={{ fontSize: '1vw', letterSpacing: '0.2em', color: '#CC1519', marginBottom: '2vh' }}
          >
            The brain
          </p>
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.5vw', color: '#FAF6F2', marginBottom: '1.5vh', lineHeight: 1.1 }}
          >
            Claude AI
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.6)', lineHeight: 1.55 }}>
            Anthropic's Claude powers the Concierge and all AI styling recommendations. Safe, nuanced, and genuinely helpful.
          </p>
        </div>

        {/* Vision */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '1vw',
            padding: '3vh 2.5vw',
            border: '1px solid rgba(17,17,17,0.08)',
          }}
        >
          <p
            className="font-body uppercase"
            style={{ fontSize: '1vw', letterSpacing: '0.2em', color: '#CC1519', marginBottom: '2vh' }}
          >
            The eyes
          </p>
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.5vw', color: '#111111', marginBottom: '1.5vh', lineHeight: 1.1 }}
          >
            Pose detection
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.55 }}>
            Computer vision maps your body proportions so virtual try-on and fit suggestions are accurate — not approximate.
          </p>
        </div>

        {/* Data */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '1vw',
            padding: '3vh 2.5vw',
            border: '1px solid rgba(17,17,17,0.08)',
          }}
        >
          <p
            className="font-body uppercase"
            style={{ fontSize: '1vw', letterSpacing: '0.2em', color: '#CC1519', marginBottom: '2vh' }}
          >
            The memory
          </p>
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.5vw', color: '#111111', marginBottom: '1.5vh', lineHeight: 1.1 }}
          >
            Supabase
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.55 }}>
            Your wardrobe, style history, and preferences stored securely and available instantly across all your devices.
          </p>
        </div>

        {/* Infrastructure */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: 'rgba(204,21,25,0.05)',
            borderRadius: '1vw',
            padding: '3vh 2.5vw',
            border: '1px solid rgba(204,21,25,0.15)',
          }}
        >
          <p
            className="font-body uppercase"
            style={{ fontSize: '1vw', letterSpacing: '0.2em', color: '#CC1519', marginBottom: '2vh' }}
          >
            The infrastructure
          </p>
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.5vw', color: '#111111', marginBottom: '1.5vh', lineHeight: 1.1 }}
          >
            AWS
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.55 }}>
            Global cloud infrastructure that scales with demand — from your first look to millions of daily users.
          </p>
        </div>
      </div>
    </div>
  );
}
