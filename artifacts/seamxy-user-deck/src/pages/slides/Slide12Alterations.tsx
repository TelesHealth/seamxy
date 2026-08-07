export default function Slide12Alterations() {
  return (
    <div className="relative w-screen h-screen overflow-hidden seamxy-bg flex">
      {/* Left content — 55% */}
      <div className="flex flex-col justify-center px-[6vw] py-[8vh] w-[55%]">
        <div className="flex items-center gap-[0.8vw] mb-[2vh]">
          <div className="w-[2vw] h-[0.3vh]" style={{ background: '#CC1519' }} />
          <span
            className="font-body font-medium"
            style={{ fontSize: '1.4vw', color: '#CC1519', letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            Local Alterations
          </span>
        </div>
        <h2
          className="font-display font-bold"
          style={{ fontSize: '4.8vw', lineHeight: 1.08, color: '#111111', textWrap: 'balance' }}
        >
          Get it fitted. Make it yours.
        </h2>
        <p
          className="font-body mt-[2.5vh]"
          style={{ fontSize: '2vw', color: '#4A4A4A', lineHeight: 1.65 }}
        >
          Find a tailor near you. Get a quote. Book directly — no middlemen, no hassle.
        </p>
        <div className="flex flex-col gap-[2vh] mt-[4vh]">
          <div className="flex items-start gap-[1.5vw]">
            <div
              className="w-[1.2vw] h-[1.2vw] rounded-full flex-shrink-0"
              style={{ background: '#CC1519', marginTop: '0.4vh' }}
            />
            <p className="font-body" style={{ fontSize: '1.9vw', color: '#4A4A4A', lineHeight: 1.5 }}>
              Browse local tailors and alteration specialists
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <div
              className="w-[1.2vw] h-[1.2vw] rounded-full flex-shrink-0"
              style={{ background: '#CC1519', marginTop: '0.4vh' }}
            />
            <p className="font-body" style={{ fontSize: '1.9vw', color: '#4A4A4A', lineHeight: 1.5 }}>
              Submit your garment for a clear, upfront quote
            </p>
          </div>
          <div className="flex items-start gap-[1.5vw]">
            <div
              className="w-[1.2vw] h-[1.2vw] rounded-full flex-shrink-0"
              style={{ background: '#CC1519', marginTop: '0.4vh' }}
            />
            <p className="font-body" style={{ fontSize: '1.9vw', color: '#4A4A4A', lineHeight: 1.5 }}>
              Drop off or schedule a collection — pick it up perfect
            </p>
          </div>
        </div>
      </div>
      {/* Right visual block — 45% */}
      <div className="w-[45%] flex items-center justify-center pr-[6vw] pl-[2vw]">
        <div
          className="w-full rounded-[1.5vw] flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: '#111111', height: '70vh' }}
        >
          {/* Inner border accent */}
          <div
            className="absolute"
            style={{
              top: '3.5vh',
              left: '2vw',
              right: '2vw',
              bottom: '3.5vh',
              borderRadius: '1vw',
              border: '0.15vw solid rgba(204,21,25,0.45)',
            }}
          />
          <p
            className="font-display font-bold text-white"
            style={{ fontSize: '3.8vw', lineHeight: 1.05, textAlign: 'center', position: 'relative', zIndex: 1 }}
          >
            Wear it
            <br />
            exactly right.
          </p>
          <div
            className="mt-[3vh]"
            style={{ width: '4vw', height: '0.4vh', background: '#CC1519', position: 'relative', zIndex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
