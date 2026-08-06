export default function Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '6vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[2.5vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>The Product</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[4vh]"
        style={{ fontSize: '3.8vw', lineHeight: 1.05 }}
      >
        Nine destinations. One intelligence layer.
      </h2>

      {/* Top row: 3 cards */}
      <div className="flex gap-[2vw] mb-[2vh]" style={{ flex: '1' }}>
        {/* Find Look */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#F5E8E0', padding: '2.5vh 2vw' }}>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Find Look</p>
          <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.5 }}>Situational styling for any occasion. Category, situation, vibe — AI generates complete outfit ideas with reasoning. Guest access, no account needed.</p>
        </div>

        {/* AI Concierge */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#E8ECF8', padding: '2.5vh 2vw' }}>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>AI Concierge</p>
          <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.5 }}>Conversational Claude-powered styling. 9 distinct stylist personas. Tool Use API makes recommendations shoppable. Session history persisted.</p>
        </div>

        {/* Virtual Try-On */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#0B1340', padding: '2.5vh 2vw' }}>
          <p className="font-body font-semibold text-bg mb-[1vh]" style={{ fontSize: '1.55vw' }}>Virtual Try-On</p>
          <p className="font-body" style={{ fontSize: '1.35vw', lineHeight: 1.5, color: 'rgba(250,249,246,0.7)' }}>MediaPipe pose detection identifies 33 body landmarks. TPS warping deforms garments to fit. Live AR mode via webcam. Shareable try-on links.</p>
        </div>
      </div>

      {/* Bottom row: 2 cards */}
      <div className="flex gap-[2vw]" style={{ flex: '1' }}>
        {/* Dashboard */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#1A2560', padding: '2.5vh 2vw' }}>
          <p className="font-body font-semibold text-bg mb-[1vh]" style={{ fontSize: '1.55vw' }}>Member Dashboard</p>
          <p className="font-body" style={{ fontSize: '1.35vw', lineHeight: 1.5, color: 'rgba(250,249,246,0.7)' }}>Daily AI outfit, weekly edit, wardrobe gap analysis, advisor notes. Weather-aware. Powered by style quiz + closet + body measurements.</p>
        </div>

        {/* Closet OS */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#FAF9F6', padding: '2.5vh 2vw', border: '0.1vw solid #E8E4E0' }}>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Closet OS</p>
          <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.5 }}>Full wardrobe inventory with photo, brand, wear tracking, and estimated value. Feeds Dashboard, Concierge, and Social. Lifecycle management via "Let It Go."</p>
        </div>

        {/* Style Groups */}
        <div className="flex-1 rounded-[1vw] flex flex-col" style={{ background: '#FAF9F6', padding: '2.5vh 2vw', border: '0.1vw solid #E8E4E0' }}>
          <p className="font-body font-semibold text-primary mb-[1vh]" style={{ fontSize: '1.55vw' }}>Style Groups</p>
          <p className="font-body text-muted" style={{ fontSize: '1.35vw', lineHeight: 1.5 }}>Private friend communities for shared closets. Borrow requests, outfit polls, haul posts, and closet sales — friends-first commerce layer.</p>
        </div>
      </div>
    </div>
  );
}
