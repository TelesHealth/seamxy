const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      {/* Background image */}
      <img
        src={`${base}cover-bg.jpg`}
        crossOrigin="anonymous"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.18 }}
      />

      {/* Dark gradient overlay — left side readable */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, rgba(17,17,17,0.97) 45%, rgba(17,17,17,0.55) 100%)',
        }}
      />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: '8vw', paddingRight: '8vw' }}>
        {/* Label */}
        <div className="flex items-center" style={{ gap: '1.5vw', marginBottom: '3vh' }}>
          <div style={{ width: '3vw', height: '0.2vh', background: '#CC1519' }} />
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '1.5vw',
              letterSpacing: '0.3em',
              color: '#CC1519',
              fontWeight: 500,
            }}
          >
            INTERNAL REFERENCE
          </span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '1.5vh' }}>
          <span
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '7.5vw',
              fontWeight: 700,
              color: '#FAF6F2',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              display: 'block',
            }}
          >
            SeamXY
          </span>
          <span
            style={{
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: '5vw',
              fontWeight: 400,
              color: '#CC1519',
              lineHeight: 1.1,
              fontStyle: 'italic',
              display: 'block',
            }}
          >
            How It's Built
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '6vw', height: '0.2vh', background: '#2A2A2A', margin: '3vh 0' }} />

        {/* Subtitle row */}
        <div
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.6vw',
            color: '#8A8A8A',
            letterSpacing: '0.05em',
          }}
        >
          Architecture · Features · Infrastructure · Roadmap
        </div>
      </div>

      {/* Bottom badge */}
      <div
        className="absolute bottom-0 right-0 flex items-center"
        style={{ padding: '3vh 5vw', gap: '2vw' }}
      >
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '1.5vw',
            color: '#555555',
            letterSpacing: '0.08em',
          }}
        >
          ENGINEERING TEAM · AUGUST 2026
        </span>
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
