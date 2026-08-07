const base = import.meta.env.BASE_URL;

export default function Slide04StyleQuiz() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background image */}
      <img
        src={`${base}quiz-hero.jpg`}
        crossOrigin="anonymous"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay — heavy on the left, lighter on the right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(250,246,242,0.97) 50%, rgba(250,246,242,0.35) 100%)',
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-[6vw]">
        <div className="flex items-center gap-[0.8vw] mb-[2vh]">
          <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
          <span
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Style Quiz
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '5.5vw', lineHeight: 1.05, color: '#111111', textWrap: 'balance', maxWidth: '52vw' }}
        >
          Five minutes to understand your taste.
        </h2>
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: '2vw', color: '#4A4A4A', lineHeight: 1.65, maxWidth: '44vw' }}
        >
          Your quiz results power every recommendation — outfits, edits, and finds — personalized to you, from day one.
        </p>
        {/* Feature pills */}
        <div className="flex flex-wrap gap-[1.2vw] mt-[4.5vh]">
          <div
            className="rounded-full px-[2vw] py-[0.8vh] font-body font-medium"
            style={{ fontSize: '1.6vw', background: '#111111', color: '#FAF6F2' }}
          >
            Aesthetic
          </div>
          <div
            className="rounded-full px-[2vw] py-[0.8vh] font-body font-medium"
            style={{ fontSize: '1.6vw', background: '#CC1519', color: '#FAF6F2' }}
          >
            Lifestyle
          </div>
          <div
            className="rounded-full px-[2vw] py-[0.8vh] font-body font-medium"
            style={{ fontSize: '1.6vw', background: 'rgba(17,17,17,0.08)', color: '#111111' }}
          >
            Fit preferences
          </div>
          <div
            className="rounded-full px-[2vw] py-[0.8vh] font-body font-medium"
            style={{ fontSize: '1.6vw', background: 'rgba(17,17,17,0.08)', color: '#111111' }}
          >
            Colour palette
          </div>
        </div>
      </div>
    </div>
  );
}
