export default function Slide13Pricing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden seamxy-bg flex flex-col px-[6vw] py-[7vh]">
      {/* Header */}
      <div className="mb-[4vh]">
        <div className="flex items-center gap-[0.8vw] mb-[1.5vh]">
          <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
          <span
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Plans
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '4.5vw', lineHeight: 1.1, color: '#111111' }}
        >
          Pick your plan.
        </h2>
      </div>
      {/* Two columns */}
      <div className="flex gap-[3vw] flex-1">
        {/* Free */}
        <div
          className="flex-1 rounded-[1.5vw] px-[3vw] py-[4vh] flex flex-col"
          style={{ background: 'rgba(255,255,255,0.78)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <p
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#9A9A9A', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Free
          </p>
          <p
            className="font-display font-bold mt-[1.5vh]"
            style={{ fontSize: '4vw', color: '#111111', lineHeight: 1 }}
          >
            Always.
          </p>
          <div className="w-full h-[0.15vh] my-[2.5vh]" style={{ background: 'rgba(17,17,17,0.1)' }} />
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#111111' }} />
              <p className="font-body" style={{ fontSize: '1.8vw', color: '#4A4A4A' }}>
                Find Look — unlimited
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#111111' }} />
              <p className="font-body" style={{ fontSize: '1.8vw', color: '#4A4A4A' }}>
                Style Quiz
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#111111' }} />
              <p className="font-body" style={{ fontSize: '1.8vw', color: '#4A4A4A' }}>
                Inspo feed
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#111111' }} />
              <p className="font-body" style={{ fontSize: '1.8vw', color: '#4A4A4A' }}>
                Basic closet — up to 30 items
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#111111' }} />
              <p className="font-body" style={{ fontSize: '1.8vw', color: '#4A4A4A' }}>
                Local Alterations directory
              </p>
            </div>
          </div>
        </div>
        {/* Pro */}
        <div
          className="flex-1 rounded-[1.5vw] px-[3vw] py-[4vh] flex flex-col"
          style={{ background: '#111111' }}
        >
          <p
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Pro
          </p>
          <p
            className="font-display font-bold text-white mt-[1.5vh]"
            style={{ fontSize: '4vw', lineHeight: 1 }}
          >
            Unlimited.
          </p>
          <div className="w-full h-[0.15vh] my-[2.5vh]" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#CC1519' }} />
              <p className="font-body text-white" style={{ fontSize: '1.8vw' }}>
                Everything in Free
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#CC1519' }} />
              <p className="font-body text-white" style={{ fontSize: '1.8vw' }}>
                AI Concierge — unlimited
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#CC1519' }} />
              <p className="font-body text-white" style={{ fontSize: '1.8vw' }}>
                Virtual Try-On
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#CC1519' }} />
              <p className="font-body text-white" style={{ fontSize: '1.8vw' }}>
                Full closet — unlimited items
              </p>
            </div>
            <div className="flex items-center gap-[1vw]">
              <div className="w-[0.7vw] h-[0.7vw] rounded-full flex-shrink-0" style={{ background: '#CC1519' }} />
              <p className="font-body text-white" style={{ fontSize: '1.8vw' }}>
                Style Groups
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
