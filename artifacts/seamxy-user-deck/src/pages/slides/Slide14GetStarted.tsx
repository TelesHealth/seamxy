export default function Slide14GetStarted() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col px-[6vw] py-[8vh]"
      style={{ background: '#111111' }}
    >
      {/* Crimson accent + label */}
      <div className="flex items-center gap-[1vw]">
        <div className="w-[3vw] h-[0.4vh]" style={{ background: '#CC1519' }} />
        <span
          className="font-body font-medium"
          style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Get Started
        </span>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center">
        <h2
          className="font-display font-bold text-white"
          style={{ fontSize: '5.5vw', lineHeight: 1.05, textWrap: 'balance', maxWidth: '65vw' }}
        >
          Your best-dressed chapter starts here.
        </h2>
        <p
          className="font-body text-white/55 mt-[2vh]"
          style={{ fontSize: '2vw' }}
        >
          Three steps. Completely free.
        </p>
        {/* Steps */}
        <div className="flex gap-[4vw] mt-[5.5vh]">
          <div className="flex items-start gap-[1.5vw]">
            <div
              className="font-display font-bold"
              style={{ fontSize: '3.5vw', color: '#CC1519', lineHeight: 1, flexShrink: 0 }}
            >
              1
            </div>
            <div>
              <p
                className="font-display font-bold text-white"
                style={{ fontSize: '2.1vw', lineHeight: 1.1 }}
              >
                Sign up free
              </p>
              <p
                className="font-body text-white/45 mt-[0.8vh]"
                style={{ fontSize: '1.6vw', lineHeight: 1.5 }}
              >
                No card required.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <div
              className="font-display font-bold"
              style={{ fontSize: '3.5vw', color: '#CC1519', lineHeight: 1, flexShrink: 0 }}
            >
              2
            </div>
            <div>
              <p
                className="font-display font-bold text-white"
                style={{ fontSize: '2.1vw', lineHeight: 1.1 }}
              >
                Take the Style Quiz
              </p>
              <p
                className="font-body text-white/45 mt-[0.8vh]"
                style={{ fontSize: '1.6vw', lineHeight: 1.5 }}
              >
                Five minutes to your taste profile.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <div
              className="font-display font-bold"
              style={{ fontSize: '3.5vw', color: '#CC1519', lineHeight: 1, flexShrink: 0 }}
            >
              3
            </div>
            <div>
              <p
                className="font-display font-bold text-white"
                style={{ fontSize: '2.1vw', lineHeight: 1.1 }}
              >
                See your first outfit
              </p>
              <p
                className="font-body text-white/45 mt-[0.8vh]"
                style={{ fontSize: '1.6vw', lineHeight: 1.5 }}
              >
                Styled for you, from day one.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="flex items-end justify-between">
        <p
          className="font-display font-bold text-white"
          style={{ fontSize: '2vw', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          SeamXY
        </p>
        <p className="font-body text-white/28" style={{ fontSize: '1.6vw' }}>
          seamxy.com
        </p>
      </div>
    </div>
  );
}
