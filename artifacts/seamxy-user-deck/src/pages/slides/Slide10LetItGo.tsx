export default function Slide10LetItGo() {
  return (
    <div className="relative w-screen h-screen overflow-hidden seamxy-bg flex flex-col justify-center px-[6vw] py-[8vh]">
      {/* Label */}
      <div className="flex items-center gap-[0.8vw] mb-[2vh]">
        <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
        <span
          className="font-body font-medium"
          style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Let It Go
        </span>
      </div>
      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '6vw', lineHeight: 1.05, color: '#111111', maxWidth: '68vw', textWrap: 'balance' }}
      >
        Surface what's sitting idle.
      </h2>
      <p
        className="font-body mt-[2.5vh]"
        style={{ fontSize: '2vw', color: '#4A4A4A', lineHeight: 1.65, maxWidth: '55vw' }}
      >
        SeamXY spots the pieces you haven't touched in months. Then it's your call — keep it or move it on.
      </p>
      {/* Option pills */}
      <div className="flex gap-[2vw] mt-[5.5vh]">
        <div className="rounded-full px-[3.5vw] py-[1.5vh]" style={{ background: '#111111' }}>
          <p className="font-display font-bold text-white" style={{ fontSize: '2.3vw' }}>
            Lend
          </p>
        </div>
        <div className="rounded-full px-[3.5vw] py-[1.5vh]" style={{ background: '#CC1519' }}>
          <p className="font-display font-bold text-white" style={{ fontSize: '2.3vw' }}>
            Sell
          </p>
        </div>
        <div className="rounded-full px-[3.5vw] py-[1.5vh]" style={{ background: 'rgba(17,17,17,0.08)' }}>
          <p className="font-display font-bold" style={{ fontSize: '2.3vw', color: '#111111' }}>
            Donate
          </p>
        </div>
        <div className="rounded-full px-[3.5vw] py-[1.5vh]" style={{ background: 'rgba(17,17,17,0.08)' }}>
          <p className="font-display font-bold" style={{ fontSize: '2.3vw', color: '#111111' }}>
            Keep
          </p>
        </div>
      </div>
      <p className="font-body mt-[3vh]" style={{ fontSize: '1.7vw', color: '#9A9A9A' }}>
        Your wardrobe. Your rules.
      </p>
    </div>
  );
}
