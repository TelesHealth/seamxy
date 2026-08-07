export default function Slide05Inspo() {
  return (
    <div className="relative w-screen h-screen overflow-hidden seamxy-bg flex">
      {/* Left content — 50% */}
      <div className="flex flex-col justify-center px-[6vw] py-[8vh] w-[50%]">
        <div className="flex items-center gap-[0.8vw] mb-[2vh]">
          <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
          <span
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Inspo
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '5vw', lineHeight: 1.05, color: '#111111', textWrap: 'balance' }}
        >
          Editorial inspiration, curated to your vibe.
        </h2>
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: '2vw', color: '#4A4A4A', lineHeight: 1.65 }}
        >
          SeamXY learns what you love and surfaces looks that feel like they were picked just for you.
        </p>
        <div className="mt-[3vh] flex flex-col gap-[0.8vh]">
          <p className="font-body" style={{ fontSize: '1.8vw', color: '#6B6B6B', lineHeight: 1.7 }}>
            — Discover new aesthetics
          </p>
          <p className="font-body" style={{ fontSize: '1.8vw', color: '#6B6B6B', lineHeight: 1.7 }}>
            — Save looks that speak to you
          </p>
          <p className="font-body" style={{ fontSize: '1.8vw', color: '#6B6B6B', lineHeight: 1.7 }}>
            — Get outfit ideas from each one
          </p>
        </div>
      </div>
      {/* Right visual mosaic — 50% */}
      <div className="w-[50%] flex flex-col justify-center px-[3vw] pr-[6vw] gap-[1.5vh]">
        {/* Card 1 — dark */}
        <div
          className="rounded-[1vw] px-[2.5vw] py-[2.5vh]"
          style={{ background: '#111111' }}
        >
          <p className="font-display font-bold text-white" style={{ fontSize: '1.9vw' }}>
            Quiet luxury
          </p>
          <p
            className="font-body text-white/50 mt-[0.5vh]"
            style={{ fontSize: '1.55vw', lineHeight: 1.5 }}
          >
            Understated. Refined. Timeless.
          </p>
        </div>
        {/* Card row */}
        <div className="flex gap-[1.5vw]">
          <div
            className="rounded-[1vw] px-[2.2vw] py-[2.5vh] flex-1"
            style={{ background: '#CC1519' }}
          >
            <p className="font-display font-bold text-white" style={{ fontSize: '1.9vw' }}>
              Coastal cool
            </p>
            <p
              className="font-body text-white/70 mt-[0.5vh]"
              style={{ fontSize: '1.55vw', lineHeight: 1.5 }}
            >
              Relaxed. Sun-kissed.
            </p>
          </div>
          <div
            className="rounded-[1vw] px-[2.2vw] py-[2.5vh] flex-1"
            style={{ background: 'rgba(17,17,17,0.07)' }}
          >
            <p className="font-display font-bold" style={{ fontSize: '1.9vw', color: '#111111' }}>
              City sharp
            </p>
            <p
              className="font-body mt-[0.5vh]"
              style={{ fontSize: '1.55vw', color: '#6B6B6B', lineHeight: 1.5 }}
            >
              Bold. Urban. Put-together.
            </p>
          </div>
        </div>
        {/* Card 3 */}
        <div
          className="rounded-[1vw] px-[2.5vw] py-[2.5vh]"
          style={{ background: 'rgba(255,255,255,0.72)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '1.9vw', color: '#111111' }}>
            Romantic edit
          </p>
          <p
            className="font-body mt-[0.5vh]"
            style={{ fontSize: '1.55vw', color: '#6B6B6B', lineHeight: 1.5 }}
          >
            Soft silhouettes. Feminine details.
          </p>
        </div>
      </div>
    </div>
  );
}
