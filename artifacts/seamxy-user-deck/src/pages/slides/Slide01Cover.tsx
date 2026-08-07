const base = import.meta.env.BASE_URL;

export default function Slide01Cover() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#111111' }}
    >
      {/* Hero image */}
      <img
        src={`${base}cover-hero.jpg`}
        crossOrigin="anonymous"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-55"
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(17,17,17,0.92) 0%, rgba(17,17,17,0.55) 55%, rgba(17,17,17,0.75) 100%)',
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-[6vw] py-[6vh]">
        {/* Logo */}
        <div>
          <span
            className="font-body font-bold text-white"
            style={{ fontSize: '1.6vw', letterSpacing: '0.18em', textTransform: 'uppercase' }}
          >
            SeamXY
          </span>
        </div>
        {/* Main content — bottom-anchored */}
        <div className="flex-1 flex flex-col justify-end pb-[5vh]">
          <div className="w-[5vw] h-[0.4vh] mb-[3vh]" style={{ background: '#CC1519' }} />
          <h1
            className="font-display font-bold text-white"
            style={{ fontSize: '7.5vw', lineHeight: 0.95, letterSpacing: '-0.02em', textWrap: 'balance' }}
          >
            Style, sorted.
          </h1>
          <p
            className="font-body text-white/65 mt-[2.5vh]"
            style={{ fontSize: '2.2vw', fontWeight: 400 }}
          >
            Your wardrobe, elevated.
          </p>
          <p
            className="font-body text-white/35 mt-[2vh]"
            style={{ fontSize: '1.5vw', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            seamxy.com
          </p>
        </div>
      </div>
    </div>
  );
}
