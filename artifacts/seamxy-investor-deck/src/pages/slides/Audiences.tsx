export default function Audiences() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>Who We Serve</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[6vh]"
        style={{ fontSize: '4.2vw', lineHeight: 1.05 }}
      >
        Three audiences. One platform.
      </h2>

      {/* Three columns */}
      <div className="flex gap-[3vw] flex-1">
        {/* Consumers */}
        <div className="flex-1 flex flex-col">
          <div className="bg-accent mb-[3vh]" style={{ height: '0.5vh', width: '100%' }} />
          <p
            className="font-display font-bold text-primary mb-[2.5vh]"
            style={{ fontSize: '2.8vw', lineHeight: 1.1 }}
          >
            Consumers
          </p>
          <p className="font-body text-muted mb-[3vh]" style={{ fontSize: '1.5vw', lineHeight: 1.6 }}>
            Style-forward individuals who want a smarter relationship with their wardrobe.
          </p>
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-start gap-[1vw]">
              <div className="bg-accent rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0 }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>AI outfit recommendations daily</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="bg-accent rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0 }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Virtual try-on before purchasing</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="bg-accent rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0 }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Closet management and lifecycle</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="bg-accent rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0 }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Local alterations and tailoring</p>
            </div>
          </div>
        </div>

        {/* Communities */}
        <div className="flex-1 flex flex-col">
          <div style={{ height: '0.5vh', width: '100%', marginBottom: '3vh', background: '#0B1340' }} />
          <p
            className="font-display font-bold text-primary mb-[2.5vh]"
            style={{ fontSize: '2.8vw', lineHeight: 1.1 }}
          >
            Communities
          </p>
          <p className="font-body text-muted mb-[3vh]" style={{ fontSize: '1.5vw', lineHeight: 1.6 }}>
            Friend groups who share their wardrobes, style opinions, and new finds together.
          </p>
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#0B1340' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Shared closet access and borrowing</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#0B1340' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Outfit polls before deciding</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#0B1340' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Haul posts with group reactions</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#0B1340' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Friends-first closet sales</p>
            </div>
          </div>
        </div>

        {/* Businesses */}
        <div className="flex-1 flex flex-col">
          <div className="bg-warm mb-[3vh]" style={{ height: '0.5vh', width: '100%' }} />
          <p
            className="font-display font-bold text-primary mb-[2.5vh]"
            style={{ fontSize: '2.8vw', lineHeight: 1.1 }}
          >
            Businesses
          </p>
          <p className="font-body text-muted mb-[3vh]" style={{ fontSize: '1.5vw', lineHeight: 1.6 }}>
            Brands, creators, makers, and tailors who grow their business on the SeamXY ecosystem.
          </p>
          <div className="flex flex-col gap-[1.5vh]">
            <div className="flex items-start gap-[1vw]">
              <div className="bg-warm rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#C4956A' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Supplier portal with AI catalog</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#C4956A' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Creator studio with subscriptions</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#C4956A' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Gig economy for tailors</p>
            </div>
            <div className="flex items-start gap-[1vw]">
              <div className="rounded-full mt-[0.6vh]" style={{ width: '0.5vw', height: '0.5vw', flexShrink: 0, background: '#C4956A' }} />
              <p className="font-body text-primary" style={{ fontSize: '1.45vw' }}>Bespoke makers directory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
