export default function Slide09Closet() {
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
            Your Closet
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '4.5vw', lineHeight: 1.1, color: '#111111' }}
        >
          Everything you own, organized.
        </h2>
        <p className="font-body mt-[1.5vh]" style={{ fontSize: '2vw', color: '#6B6B6B' }}>
          Know what you have. Wear it more.
        </p>
      </div>
      {/* Three columns */}
      <div className="flex gap-[2.5vw] flex-1">
        <div
          className="flex-1 rounded-[1.2vw] px-[2.5vw] py-[3.5vh] flex flex-col"
          style={{ background: 'rgba(255,255,255,0.75)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '3vw', color: '#CC1519', lineHeight: 1 }}>
            Add
          </p>
          <p
            className="font-display font-bold mt-[1.5vh]"
            style={{ fontSize: '2.3vw', color: '#111111' }}
          >
            Log what you own
          </p>
          <p
            className="font-body mt-[1.5vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.6 }}
          >
            Photograph items, scan tags, or browse your order history. Your closet builds itself.
          </p>
        </div>
        <div
          className="flex-1 rounded-[1.2vw] px-[2.5vw] py-[3.5vh] flex flex-col"
          style={{ background: '#111111' }}
        >
          <p className="font-display font-bold" style={{ fontSize: '3vw', color: '#CC1519', lineHeight: 1 }}>
            See
          </p>
          <p
            className="font-display font-bold text-white mt-[1.5vh]"
            style={{ fontSize: '2.3vw' }}
          >
            Browse everything
          </p>
          <p
            className="font-body text-white/60 mt-[1.5vh]"
            style={{ fontSize: '1.7vw', lineHeight: 1.6 }}
          >
            Filter by category, colour, or occasion. Never forget what you own again.
          </p>
        </div>
        <div
          className="flex-1 rounded-[1.2vw] px-[2.5vw] py-[3.5vh] flex flex-col"
          style={{ background: '#CC1519' }}
        >
          <p
            className="font-display font-bold"
            style={{ fontSize: '3vw', color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}
          >
            Wear
          </p>
          <p
            className="font-display font-bold text-white mt-[1.5vh]"
            style={{ fontSize: '2.3vw' }}
          >
            Wear it more
          </p>
          <p
            className="font-body text-white/80 mt-[1.5vh]"
            style={{ fontSize: '1.7vw', lineHeight: 1.6 }}
          >
            SeamXY tracks what you wear so nothing gets forgotten at the back of the rail.
          </p>
        </div>
      </div>
    </div>
  );
}
