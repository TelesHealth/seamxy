export default function Slide11Ecosystem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col seamxy-bg"
      style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
    >
      {/* Top label */}
      <div className="flex items-center gap-[2vw]" style={{ marginBottom: '3vh' }}>
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519' }}>
          The Ecosystem
        </p>
      </div>

      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '4.2vw', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#111111', marginBottom: '5vh' }}
      >
        Creators, makers, tailors, suppliers — all connected.
      </h2>

      {/* Four ecosystem nodes */}
      <div className="flex gap-[2vw] flex-1">
        {/* Creators */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: '#111111',
            borderRadius: '1vw',
            padding: '3vh 2vw',
          }}
        >
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.2vw', color: '#CC1519', marginBottom: '1.5vh' }}
          >
            Creators
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: 'rgba(250,246,242,0.65)', lineHeight: 1.55, marginBottom: '2vh' }}>
            Stylists and influencers who share looks, build audiences, and earn on every outfit that converts.
          </p>
          <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,246,242,0.4)' }}>Styling profiles · Creator storefronts · Commission tools</p>
        </div>

        {/* Makers */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '1vw',
            padding: '3vh 2vw',
            border: '1px solid rgba(17,17,17,0.08)',
          }}
        >
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.2vw', color: '#111111', marginBottom: '1.5vh' }}
          >
            Makers
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.55, marginBottom: '2vh' }}>
            Independent designers and emerging brands who reach a ready-to-buy audience through styled context.
          </p>
          <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(107,95,90,0.7)' }}>Brand profiles · Shoppable looks · Discovery reach</p>
        </div>

        {/* Tailors */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.65)',
            borderRadius: '1vw',
            padding: '3vh 2vw',
            border: '1px solid rgba(17,17,17,0.08)',
          }}
        >
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.2vw', color: '#111111', marginBottom: '1.5vh' }}
          >
            Tailors
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.55, marginBottom: '2vh' }}>
            Local and independent alteration professionals who get discovered when users need pieces adjusted to fit.
          </p>
          <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(107,95,90,0.7)' }}>Service listings · Fit profiles · Local matching</p>
        </div>

        {/* Suppliers */}
        <div
          className="flex flex-col"
          style={{
            flex: 1,
            background: 'rgba(204,21,25,0.06)',
            borderRadius: '1vw',
            padding: '3vh 2vw',
            border: '1px solid rgba(204,21,25,0.15)',
          }}
        >
          <p
            className="font-display font-semibold"
            style={{ fontSize: '2.2vw', color: '#CC1519', marginBottom: '1.5vh' }}
          >
            Suppliers
          </p>
          <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A', lineHeight: 1.55, marginBottom: '2vh' }}>
            Retail brands and distributors whose catalogs are surfaced at the exact moment a user is looking for something new.
          </p>
          <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(107,95,90,0.7)' }}>Catalog sync · Intent targeting · Style-native ads</p>
        </div>
      </div>
    </div>
  );
}
