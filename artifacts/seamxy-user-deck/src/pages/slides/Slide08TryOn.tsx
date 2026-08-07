const base = import.meta.env.BASE_URL;

export default function Slide08TryOn() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={`${base}tryon-hero.jpg`}
        crossOrigin="anonymous"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay — heavy right, light left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to left, rgba(17,17,17,0.90) 38%, rgba(17,17,17,0.18) 100%)',
        }}
      />
      {/* Content — right aligned */}
      <div className="relative z-10 flex flex-col justify-center h-full pr-[6vw] pl-[6vw] items-end">
        <div className="max-w-[50vw] text-right">
          <div className="flex items-center justify-end gap-[0.8vw] mb-[2vh]">
            <span
              className="font-body font-medium"
              style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
            >
              Virtual Try-On
            </span>
            <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
          </div>
          <h2
            className="font-display font-bold text-white"
            style={{ fontSize: '5.5vw', lineHeight: 1.05, textWrap: 'balance' }}
          >
            Try before you fall in love.
          </h2>
          <p
            className="font-body text-white/75 mt-[2.5vh]"
            style={{ fontSize: '2vw', lineHeight: 1.65 }}
          >
            Upload your photo. Try on anything. Share the look — or save it for later.
          </p>
          <div className="flex flex-col items-end gap-[1.2vh] mt-[3.5vh]">
            <p className="font-body text-white/55" style={{ fontSize: '1.7vw' }}>
              Upload your photo in seconds
            </p>
            <p className="font-body text-white/55" style={{ fontSize: '1.7vw' }}>
              Try on any item from the platform
            </p>
            <p className="font-body text-white/55" style={{ fontSize: '1.7vw' }}>
              Share or shop the full look
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
