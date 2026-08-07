export default function Slide04Audiences() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col seamxy-bg"
      style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
    >
      {/* Top label */}
      <div className="flex items-center gap-[2vw]" style={{ marginBottom: '3.5vh' }}>
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519' }}>
          Three Audiences
        </p>
      </div>

      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '4.5vw', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#111111', marginBottom: '6vh' }}
      >
        One platform. Every context.
      </h2>

      {/* Three columns */}
      <div className="flex gap-[3vw] flex-1">
        {/* Individuals */}
        <div className="flex-1 flex flex-col" style={{ borderTop: '0.3vh solid #CC1519', paddingTop: '3vh' }}>
          <p
            className="font-display font-bold"
            style={{ fontSize: '3vw', lineHeight: 1.0, color: '#111111', marginBottom: '2vh' }}
          >
            For you.
          </p>
          <p
            className="font-body font-semibold"
            style={{ fontSize: '1.5vw', color: '#CC1519', marginBottom: '2vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Individuals
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', lineHeight: 1.6, color: '#6B5F5A' }}>
            A personal style intelligence that knows your wardrobe, your body, your taste, and your calendar.
          </p>
          <div style={{ marginTop: '3vh' }}>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: '#111111' }}>
              — Outfit suggestions for any occasion
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: '#111111' }}>
              — Virtual try-on before you buy
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: '#111111' }}>
              — AI Concierge, always on call
            </p>
          </div>
        </div>

        {/* Friend Groups */}
        <div
          className="flex-1 flex flex-col"
          style={{ background: '#111111', borderRadius: '1vw', padding: '3vh 2.5vw' }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: '3vw', lineHeight: 1.0, color: '#FAF6F2', marginBottom: '2vh' }}
          >
            For us.
          </p>
          <p
            className="font-body font-semibold"
            style={{ fontSize: '1.5vw', color: '#CC1519', marginBottom: '2vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Friend Groups
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', lineHeight: 1.6, color: 'rgba(250,246,242,0.7)' }}>
            Style is social. Share closets, vote on looks, and get dressed together — even when you're apart.
          </p>
          <div style={{ marginTop: '3vh' }}>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: 'rgba(250,246,242,0.85)' }}>
              — Shared style boards
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: 'rgba(250,246,242,0.85)' }}>
              — Closet borrowing
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: 'rgba(250,246,242,0.85)' }}>
              — Group outfit voting
            </p>
          </div>
        </div>

        {/* Businesses */}
        <div className="flex-1 flex flex-col" style={{ borderTop: '0.3vh solid rgba(17,17,17,0.2)', paddingTop: '3vh' }}>
          <p
            className="font-display font-bold"
            style={{ fontSize: '3vw', lineHeight: 1.0, color: '#111111', marginBottom: '2vh' }}
          >
            For brands.
          </p>
          <p
            className="font-body font-semibold"
            style={{ fontSize: '1.5vw', color: '#CC1519', marginBottom: '2vh', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Businesses
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', lineHeight: 1.6, color: '#6B5F5A' }}>
            Reach buyers at the moment of decision. Connect your catalog to an audience that's actively styling.
          </p>
          <div style={{ marginTop: '3vh' }}>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: '#111111' }}>
              — Shoppable product integration
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: '#111111' }}>
              — Creator partnerships
            </p>
            <p className="font-body" style={{ fontSize: '1.5vw', lineHeight: 1.7, color: '#111111' }}>
              — Style-native advertising
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
