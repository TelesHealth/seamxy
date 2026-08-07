export default function Slide02WhatIs() {
  return (
    <div className="relative w-screen h-screen overflow-hidden seamxy-bg flex">
      {/* Left side — 55% */}
      <div className="flex flex-col justify-center px-[6vw] py-[8vh] w-[55%]">
        <div className="flex items-center gap-[0.8vw] mb-[2.5vh]">
          <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
          <span
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            About SeamXY
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '4.5vw', lineHeight: 1.08, color: '#111111', textWrap: 'balance' }}
        >
          Your personal style operating system.
        </h2>
        <p
          className="font-body mt-[3vh]"
          style={{ fontSize: '2vw', color: '#4A4A4A', lineHeight: 1.65, maxWidth: '40vw' }}
        >
          SeamXY brings together AI, your wardrobe, and real style intelligence — so getting dressed feels effortless, every single day.
        </p>
      </div>
      {/* Right side — 45% */}
      <div className="flex flex-col justify-center gap-[2.5vh] px-[3vw] pr-[6vw] w-[45%]">
        <div
          className="rounded-[1vw] px-[2.5vw] py-[2.5vh]"
          style={{ background: 'rgba(204,21,25,0.06)', borderLeft: '0.35vw solid #CC1519' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.1vw', color: '#111111' }}>
            Find your style
          </p>
          <p
            className="font-body mt-[0.8vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            Describe any occasion. Get a complete outfit in seconds.
          </p>
        </div>
        <div
          className="rounded-[1vw] px-[2.5vw] py-[2.5vh]"
          style={{ background: 'rgba(17,17,17,0.05)', borderLeft: '0.35vw solid #111111' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.1vw', color: '#111111' }}>
            Know your wardrobe
          </p>
          <p
            className="font-body mt-[0.8vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            Everything you own, organized and ready to wear.
          </p>
        </div>
        <div
          className="rounded-[1vw] px-[2.5vw] py-[2.5vh]"
          style={{ background: 'rgba(204,21,25,0.06)', borderLeft: '0.35vw solid #CC1519' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '2.1vw', color: '#111111' }}>
            Share and discover
          </p>
          <p
            className="font-body mt-[0.8vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            Shop from friends. Borrow. Sell. Build your community.
          </p>
        </div>
      </div>
    </div>
  );
}
