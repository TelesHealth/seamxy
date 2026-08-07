export default function Slide10StyleGroups() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#111111' }}
    >
      {/* Background accent */}
      <div
        className="absolute"
        style={{
          bottom: '-20%',
          left: '-10%',
          width: '60vw',
          height: '80vh',
          background: 'radial-gradient(ellipse at bottom left, rgba(204,21,25,0.09) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left — headline */}
      <div
        className="absolute flex flex-col justify-center h-full"
        style={{ left: '7vw', width: '40vw', paddingTop: '8vh', paddingBottom: '8vh' }}
      >
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519', marginBottom: '3vh' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519', marginBottom: '3.5vh' }}>
          Style Groups
        </p>

        <h2
          className="font-display"
          style={{ fontSize: '5vw', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.01em', color: '#FAF6F2', marginBottom: '3.5vh', textWrap: 'balance' }}
        >
          Style is social. Borrow. Share. Vote.
        </h2>

        <p
          className="font-body"
          style={{ fontSize: '1.9vw', lineHeight: 1.6, color: 'rgba(250,246,242,0.6)', marginBottom: '5vh' }}
        >
          Create or join style groups with friends, colleagues, or communities. Share your closet. Vote on looks. Get dressed together.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
          <p className="font-body" style={{ fontSize: '1.6vw', color: 'rgba(250,246,242,0.75)', lineHeight: 1.5 }}>
            — Request a piece from a friend's closet
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', color: 'rgba(250,246,242,0.75)', lineHeight: 1.5 }}>
            — Post your outfit, get live feedback
          </p>
          <p className="font-body" style={{ fontSize: '1.6vw', color: 'rgba(250,246,242,0.75)', lineHeight: 1.5 }}>
            — Build group looks for events
          </p>
        </div>
      </div>

      {/* Right — group social UI */}
      <div
        className="absolute flex flex-col justify-center"
        style={{ right: '7vw', top: '8vh', bottom: '8vh', width: '42vw', gap: '2vh' }}
      >
        {/* Group header */}
        <div
          style={{
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(250,246,242,0.1)',
            borderRadius: '1vw',
            padding: '2.5vh 2.5vw',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5vw',
          }}
        >
          <div style={{ width: '4vw', height: '4vw', borderRadius: '50%', background: '#CC1519', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <p className="font-display font-bold" style={{ fontSize: '1.8vw', color: '#FAF6F2' }}>W</p>
          </div>
          <div>
            <p className="font-body font-semibold" style={{ fontSize: '1.6vw', color: '#FAF6F2' }}>Weekend Crew</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,246,242,0.45)' }}>4 members · 62 shared pieces</p>
          </div>
        </div>

        {/* Post */}
        <div
          style={{
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(250,246,242,0.1)',
            borderRadius: '1vw',
            padding: '2.5vh 2.5vw',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2vw', marginBottom: '1.5vh' }}>
            <div style={{ width: '2.5vw', height: '2.5vw', borderRadius: '50%', background: 'rgba(204,21,25,0.4)', flexShrink: 0 }} />
            <p className="font-body font-semibold" style={{ fontSize: '1.4vw', color: '#FAF6F2' }}>Maya</p>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,246,242,0.4)' }}>posted an outfit</p>
          </div>
          <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.75)', lineHeight: 1.5, marginBottom: '2vh' }}>
            Heading to the opening tomorrow — thoughts?
          </p>
          <div style={{ display: 'flex', gap: '1.2vw' }}>
            <div style={{ background: 'rgba(204,21,25,0.15)', borderRadius: '99px', padding: '0.8vh 1.5vw' }}>
              <p className="font-body" style={{ fontSize: '1.3vw', color: '#CC1519' }}>Love it · 3</p>
            </div>
            <div style={{ background: 'rgba(250,246,242,0.06)', borderRadius: '99px', padding: '0.8vh 1.5vw' }}>
              <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,246,242,0.5)' }}>Add a belt · 2</p>
            </div>
          </div>
        </div>

        {/* Borrow request */}
        <div
          style={{
            background: 'rgba(250,246,242,0.05)',
            border: '1px solid rgba(204,21,25,0.25)',
            borderRadius: '1vw',
            padding: '2.5vh 2.5vw',
          }}
        >
          <p className="font-body font-semibold" style={{ fontSize: '1.4vw', color: '#CC1519', marginBottom: '0.8vh' }}>Borrow request</p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.75)', lineHeight: 1.5 }}>
            Priya would like to borrow your camel blazer for Saturday.
          </p>
        </div>
      </div>
    </div>
  );
}
