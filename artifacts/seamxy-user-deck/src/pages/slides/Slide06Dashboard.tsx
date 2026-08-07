export default function Slide06Dashboard() {
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
            Your Dashboard
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '4.5vw', lineHeight: 1.1, color: '#111111' }}
        >
          Your morning routine, sorted.
        </h2>
        <p
          className="font-body mt-[1.5vh]"
          style={{ fontSize: '2vw', color: '#6B6B6B' }}
        >
          Everything you need, right when you open the app.
        </p>
      </div>
      {/* Three columns */}
      <div className="flex gap-[2.5vw] flex-1">
        {/* Column 1 */}
        <div
          className="flex-1 rounded-[1.2vw] px-[2.5vw] py-[3.5vh] flex flex-col"
          style={{ background: '#111111' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '3vw', color: '#CC1519', lineHeight: 1 }}>
            01
          </div>
          <p
            className="font-display font-bold text-white mt-[1.5vh]"
            style={{ fontSize: '2.3vw' }}
          >
            Daily Outfit
          </p>
          <p
            className="font-body text-white/60 mt-[1.5vh]"
            style={{ fontSize: '1.7vw', lineHeight: 1.6 }}
          >
            A complete look styled from your closet every morning.
          </p>
        </div>
        {/* Column 2 */}
        <div
          className="flex-1 rounded-[1.2vw] px-[2.5vw] py-[3.5vh] flex flex-col"
          style={{ background: '#CC1519' }}
        >
          <div
            className="font-display font-bold"
            style={{ fontSize: '3vw', color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}
          >
            02
          </div>
          <p
            className="font-display font-bold text-white mt-[1.5vh]"
            style={{ fontSize: '2.3vw' }}
          >
            Weekly Edit
          </p>
          <p
            className="font-body text-white/80 mt-[1.5vh]"
            style={{ fontSize: '1.7vw', lineHeight: 1.6 }}
          >
            Seven days of outfits, planned so you never scramble.
          </p>
        </div>
        {/* Column 3 */}
        <div
          className="flex-1 rounded-[1.2vw] px-[2.5vw] py-[3.5vh] flex flex-col"
          style={{ background: 'rgba(255,255,255,0.75)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <div className="font-display font-bold" style={{ fontSize: '3vw', color: '#CC1519', lineHeight: 1 }}>
            03
          </div>
          <p
            className="font-display font-bold mt-[1.5vh]"
            style={{ fontSize: '2.3vw', color: '#111111' }}
          >
            Wardrobe Gaps
          </p>
          <p
            className="font-body mt-[1.5vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.6 }}
          >
            See what's missing. Find it without the scroll.
          </p>
        </div>
      </div>
    </div>
  );
}
