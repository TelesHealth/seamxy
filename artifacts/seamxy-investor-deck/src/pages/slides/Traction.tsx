export default function Traction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>Platform Depth</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[6vh]"
        style={{ fontSize: '4vw', lineHeight: 1.05 }}
      >
        Production-grade from day one.
      </h2>

      {/* Stats grid: 2x2 */}
      <div className="flex gap-[3vw] flex-1">
        {/* Row 1 */}
        <div className="flex flex-col gap-[3vh] flex-1">
          <div className="flex-1 flex flex-col justify-center rounded-[1vw]" style={{ background: '#111111', padding: '3vh 3vw' }}>
            <p
              className="font-display font-bold text-accent mb-[1.5vh]"
              style={{ fontSize: '6vw', lineHeight: 1.0 }}
            >
              310+
            </p>
            <p className="font-body font-semibold text-bg mb-[0.8vh]" style={{ fontSize: '1.6vw' }}>Git commits</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,249,246,0.65)', lineHeight: 1.4 }}>Continuous development from October 2025 through August 2026</p>
          </div>

          <div className="flex-1 flex flex-col justify-center rounded-[1vw]" style={{ background: '#F5E8E0', padding: '3vh 3vw' }}>
            <p
              className="font-display font-bold text-primary mb-[1.5vh]"
              style={{ fontSize: '6vw', lineHeight: 1.0 }}
            >
              18+
            </p>
            <p className="font-body font-semibold text-primary mb-[0.8vh]" style={{ fontSize: '1.6vw' }}>Distinct features</p>
            <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.4 }}>Find Look, Concierge, Try-On, Closet, Dashboard, Groups, Gig, Makers, Creator Studio, and more</p>
          </div>
        </div>

        <div className="flex flex-col gap-[3vh] flex-1">
          <div className="flex-1 flex flex-col justify-center rounded-[1vw]" style={{ background: '#FAE8E8', padding: '3vh 3vw' }}>
            <p
              className="font-display font-bold text-primary mb-[1.5vh]"
              style={{ fontSize: '6vw', lineHeight: 1.0 }}
            >
              9
            </p>
            <p className="font-body font-semibold text-primary mb-[0.8vh]" style={{ fontSize: '1.6vw' }}>Nav destinations</p>
            <p className="font-body text-muted" style={{ fontSize: '1.4vw', lineHeight: 1.4 }}>Home, System, Find Look, Quiz, Inspo, Concierge, Dashboard, Try-On, Closet — all built and live</p>
          </div>

          <div className="flex-1 flex flex-col justify-center rounded-[1vw]" style={{ background: '#111111', padding: '3vh 3vw' }}>
            <p
              className="font-display font-bold text-accent mb-[1.5vh]"
              style={{ fontSize: '6vw', lineHeight: 1.0 }}
            >
              3
            </p>
            <p className="font-body font-semibold text-bg mb-[0.8vh]" style={{ fontSize: '1.6vw' }}>Auth tracks</p>
            <p className="font-body" style={{ fontSize: '1.4vw', color: 'rgba(250,249,246,0.65)', lineHeight: 1.4 }}>Separate customer, supplier, and admin authentication with full RBAC middleware</p>
          </div>
        </div>
      </div>
    </div>
  );
}
