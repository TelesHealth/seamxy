export default function Slide07Concierge() {
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
            AI Concierge
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '5vw', lineHeight: 1.05, color: '#111111', textWrap: 'balance' }}
        >
          Ask anything. Get a real answer.
        </h2>
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: '2vw', color: '#4A4A4A', lineHeight: 1.65 }}
        >
          Your personal stylist, available any time. Tell it where you're going — it will tell you what to wear.
        </p>
        <div className="mt-[3vh] flex flex-col gap-[1vh]">
          <p className="font-body" style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.6 }}>
            — "What do I wear to a garden party?"
          </p>
          <p className="font-body" style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.6 }}>
            — "What's missing from my wardrobe?"
          </p>
          <p className="font-body" style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.6 }}>
            — "Style me for a job interview"
          </p>
        </div>
      </div>
      {/* Right — chat card */}
      <div className="w-[50%] flex items-center justify-center px-[3vw] pr-[6vw]">
        <div
          className="w-full rounded-[1.5vw] overflow-hidden"
          style={{ background: '#111111', boxShadow: '0 1vh 4vh rgba(17,17,17,0.3)' }}
        >
          {/* Header */}
          <div
            className="px-[2.5vw] py-[2vh]"
            style={{ borderBottom: '0.1vh solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-[1vw]">
              <div className="w-[1.4vw] h-[1.4vw] rounded-full" style={{ background: '#CC1519' }} />
              <p className="font-body font-medium text-white" style={{ fontSize: '1.6vw' }}>
                SeamXY Concierge
              </p>
            </div>
          </div>
          {/* Chat bubbles */}
          <div className="px-[2.5vw] py-[2.5vh] flex flex-col gap-[2.5vh]">
            {/* User message */}
            <div className="flex justify-end">
              <div
                className="rounded-[0.8vw] px-[1.8vw] py-[1.2vh]"
                style={{ background: '#CC1519', maxWidth: '78%' }}
              >
                <p
                  className="font-body text-white"
                  style={{ fontSize: '1.6vw', lineHeight: 1.55 }}
                >
                  What should I wear to a garden party this weekend?
                </p>
              </div>
            </div>
            {/* Concierge response */}
            <div className="flex justify-start">
              <div
                className="rounded-[0.8vw] px-[1.8vw] py-[1.2vh]"
                style={{ background: 'rgba(255,255,255,0.08)', maxWidth: '88%' }}
              >
                <p
                  className="font-body text-white/85"
                  style={{ fontSize: '1.6vw', lineHeight: 1.65 }}
                >
                  A floral midi dress or wide-leg linen trousers with a fitted blouse would be perfect. Pair either with block-heeled sandals and a basket bag — elegant but garden-ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
