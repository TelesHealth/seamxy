export default function Slide03FindLook() {
  return (
    <div className="relative w-screen h-screen overflow-hidden seamxy-bg flex flex-col justify-center px-[6vw] py-[7vh]">
      {/* Label */}
      <div className="flex items-center gap-[0.8vw] mb-[2vh]">
        <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
        <span
          className="font-body font-medium"
          style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          Find Look
        </span>
      </div>
      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '5vw', lineHeight: 1.05, color: '#111111', textWrap: 'balance', maxWidth: '62vw' }}
      >
        Describe your day.
        <br />
        Get your outfit.
      </h2>
      <p
        className="font-body mt-[2vh]"
        style={{ fontSize: '2vw', color: '#6B6B6B', lineHeight: 1.5 }}
      >
        No account needed. Just tell us where you're going.
      </p>
      {/* Three step cards */}
      <div className="flex gap-[2.5vw] mt-[5vh]">
        <div
          className="flex-1 rounded-[1vw] px-[2.5vw] py-[3vh] flex flex-col"
          style={{ background: 'rgba(255,255,255,0.72)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <div
            className="font-display font-bold mb-[1.5vh]"
            style={{ fontSize: '3.5vw', color: '#CC1519', lineHeight: 1 }}
          >
            01
          </div>
          <p className="font-display font-bold" style={{ fontSize: '2vw', color: '#111111' }}>
            Type your occasion
          </p>
          <p
            className="font-body mt-[1vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            "Brunch with friends on a sunny Saturday"
          </p>
        </div>
        <div
          className="flex-1 rounded-[1vw] px-[2.5vw] py-[3vh] flex flex-col"
          style={{ background: 'rgba(255,255,255,0.72)', boxShadow: '0 0.2vh 1.5vh rgba(17,17,17,0.07)' }}
        >
          <div
            className="font-display font-bold mb-[1.5vh]"
            style={{ fontSize: '3.5vw', color: '#CC1519', lineHeight: 1 }}
          >
            02
          </div>
          <p className="font-display font-bold" style={{ fontSize: '2vw', color: '#111111' }}>
            AI styles you
          </p>
          <p
            className="font-body mt-[1vh]"
            style={{ fontSize: '1.7vw', color: '#6B6B6B', lineHeight: 1.55 }}
          >
            Real outfits tailored to your taste and the moment.
          </p>
        </div>
        <div
          className="flex-1 rounded-[1vw] px-[2.5vw] py-[3vh] flex flex-col"
          style={{ background: '#111111' }}
        >
          <div
            className="font-display font-bold mb-[1.5vh]"
            style={{ fontSize: '3.5vw', color: '#CC1519', lineHeight: 1 }}
          >
            03
          </div>
          <p className="font-display font-bold text-white" style={{ fontSize: '2vw' }}>
            Save or share
          </p>
          <p
            className="font-body mt-[1vh] text-white/55"
            style={{ fontSize: '1.7vw', lineHeight: 1.55 }}
          >
            Keep the look or send it to a friend. Your choice.
          </p>
        </div>
      </div>
    </div>
  );
}
