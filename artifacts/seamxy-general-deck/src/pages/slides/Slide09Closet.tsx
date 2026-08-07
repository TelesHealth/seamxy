export default function Slide09Closet() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col seamxy-bg"
      style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '8vh', paddingBottom: '7vh' }}
    >
      {/* Top label */}
      <div className="flex items-center gap-[2vw]" style={{ marginBottom: '3.5vh' }}>
        <div style={{ height: '0.25vh', width: '3vw', background: '#CC1519' }} />
        <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.25em', color: '#CC1519' }}>
          Your Closet + Dashboard
        </p>
      </div>

      {/* Headline */}
      <h2
        className="font-display font-bold"
        style={{ fontSize: '4.5vw', lineHeight: 1.05, letterSpacing: '-0.01em', color: '#111111', marginBottom: '5vh' }}
      >
        Know what you have. Know what to wear.
      </h2>

      {/* Two-column dashboard */}
      <div className="flex gap-[3vw] flex-1">
        {/* Left — closet stats */}
        <div className="flex flex-col gap-[2.5vh]" style={{ width: '45vw' }}>
          <div
            style={{
              background: '#111111',
              borderRadius: '1vw',
              padding: '3vh 2.5vw',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.15em', color: 'rgba(250,246,242,0.45)', marginBottom: '0.8vh' }}>Total pieces</p>
              <p className="font-display font-bold" style={{ fontSize: '4vw', color: '#FAF6F2', lineHeight: 1 }}>148</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="font-body uppercase" style={{ fontSize: '1.1vw', letterSpacing: '0.15em', color: 'rgba(250,246,242,0.45)', marginBottom: '0.8vh' }}>Worn this month</p>
              <p className="font-display font-bold" style={{ fontSize: '4vw', color: '#CC1519', lineHeight: 1 }}>31</p>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '1vw',
              padding: '3vh 2.5vw',
              border: '1px solid rgba(17,17,17,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5vh',
            }}
          >
            <p className="font-body font-semibold" style={{ fontSize: '1.5vw', color: '#111111', marginBottom: '0.5vh' }}>Recently added</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.08)', paddingBottom: '1.2vh' }}>
              <p className="font-body" style={{ fontSize: '1.5vw', color: '#111111' }}>Navy trench coat</p>
              <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A' }}>3 days ago</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,17,0.08)', paddingBottom: '1.2vh' }}>
              <p className="font-body" style={{ fontSize: '1.5vw', color: '#111111' }}>Ribbed cream turtleneck</p>
              <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A' }}>1 week ago</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <p className="font-body" style={{ fontSize: '1.5vw', color: '#111111' }}>Leather ankle boots</p>
              <p className="font-body" style={{ fontSize: '1.5vw', color: '#6B5F5A' }}>2 weeks ago</p>
            </div>
          </div>
        </div>

        {/* Right — insights */}
        <div className="flex flex-col gap-[2.5vh] flex-1">
          <div
            style={{
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '1vw',
              padding: '3vh 2.5vw',
              border: '1px solid rgba(17,17,17,0.08)',
              flex: 1,
            }}
          >
            <p className="font-body font-semibold" style={{ fontSize: '1.5vw', color: '#111111', marginBottom: '2vh' }}>Style insights</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vh' }}>
                  <p className="font-body" style={{ fontSize: '1.4vw', color: '#6B5F5A' }}>Neutral tones</p>
                  <p className="font-body" style={{ fontSize: '1.4vw', color: '#111111' }}>72%</p>
                </div>
                <div style={{ height: '0.5vh', background: 'rgba(17,17,17,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '72%', background: '#111111', borderRadius: '99px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vh' }}>
                  <p className="font-body" style={{ fontSize: '1.4vw', color: '#6B5F5A' }}>Business casual</p>
                  <p className="font-body" style={{ fontSize: '1.4vw', color: '#111111' }}>58%</p>
                </div>
                <div style={{ height: '0.5vh', background: 'rgba(17,17,17,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '58%', background: '#CC1519', borderRadius: '99px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6vh' }}>
                  <p className="font-body" style={{ fontSize: '1.4vw', color: '#6B5F5A' }}>Never worn</p>
                  <p className="font-body" style={{ fontSize: '1.4vw', color: '#111111' }}>24%</p>
                </div>
                <div style={{ height: '0.5vh', background: 'rgba(17,17,17,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '24%', background: 'rgba(17,17,17,0.4)', borderRadius: '99px' }} />
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(204,21,25,0.06)',
              borderRadius: '1vw',
              padding: '2.5vh 2.5vw',
              border: '1px solid rgba(204,21,25,0.15)',
            }}
          >
            <p className="font-body font-semibold" style={{ fontSize: '1.5vw', color: '#CC1519', marginBottom: '0.8vh' }}>Suggestion</p>
            <p className="font-body" style={{ fontSize: '1.5vw', color: '#111111', lineHeight: 1.5 }}>
              24 pieces haven't been worn in 90+ days. Ready to rediscover them?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
