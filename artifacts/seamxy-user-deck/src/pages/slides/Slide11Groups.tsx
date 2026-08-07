export default function Slide11Groups() {
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
            Style Groups
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '4.5vw', lineHeight: 1.1, color: '#111111' }}
        >
          Style, shared.
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: '2vw', color: '#6B6B6B' }}>
          Your closet, open to the people you trust.
        </p>
      </div>
      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-[2vw] flex-1">
        <div
          className="rounded-[1.2vw] px-[2.5vw] py-[3vh] flex flex-col justify-center"
          style={{ background: '#111111' }}
        >
          <p className="font-display font-bold text-white" style={{ fontSize: '2.3vw' }}>
            Share your closet
          </p>
          <p
            className="font-body text-white/60 mt-[1.2vh]"
            style={{ fontSize: '1.7vw', lineHeight: 1.55 }}
          >
            Let friends browse and borrow — no questions asked.
          </p>
        </div>
        <div
          className="rounded-[1.2vw] px-[2.5vw] py-[3vh] flex flex-col justify-center"
          style={{ background: '#CC1519' }}
        >
          <p className="font-display font-bold text-white" style={{ fontSize: '2.3vw' }}>
            Vote on outfits
          </p>
          <p
            className="font-body text-white/80 mt-[1.2vh]"
            style={{ fontSize: '1.7vw', lineHeight: 1.55 }}
          >
            Share a look. Get honest feedback from your group.
          </p>
        </div>
        <div
          className="rounded-[1.2vw] px-[2.5vw] py-[3vh] flex flex-col justify-center"
          style={{ background: 'rgba(255,255,255,0.75)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.3vw', color: '#111111' }}>
            Sell to friends
          </p>
          <p
            className="font-body mt-[1.2vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            Turn idle pieces into cash — with people who know your taste.
          </p>
        </div>
        <div
          className="rounded-[1.2vw] px-[2.5vw] py-[3vh] flex flex-col justify-center"
          style={{ background: 'rgba(17,17,17,0.06)' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.3vw', color: '#111111' }}>
            Borrow freely
          </p>
          <p
            className="font-body mt-[1.2vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            Skip the buy. Borrow something perfect from a friend's group.
          </p>
        </div>
      </div>
    </div>
  );
}
