export default function GuestFeatures() {
  const features = [
    {
      label: 'HOME',
      route: '/',
      headline: 'Hero & Acquisition',
      bullets: [
        'Email capture with early-access CTA',
        'Style quiz entry — builds style identity',
        'Anonymous session tracking for funnel analytics',
        'RequestAccess sticky CTA on scroll',
      ],
    },
    {
      label: 'WORLD',
      route: '/system',
      headline: 'Intelligence System Overview',
      bullets: [
        'Explains 7 intelligence signals: Closet, Fit, Events, Weather, Inspiration, Shopping Gaps, Advisor',
        '"ONE STYLE WORLD" brand narrative',
        'Links to Find Look and Dashboard',
      ],
    },
    {
      label: 'FIND LOOK',
      route: '/get-outfit-ideas',
      headline: 'Situational Styling Engine',
      bullets: [
        'Category → Occasion → Vibe → AI generation flow',
        'Claude produces full outfits with rationale',
        '"Shop the Look" + save + email send',
        'Engagement events → anonymous_sessions table',
      ],
    },
    {
      label: 'QUIZ',
      route: '/style-quiz',
      headline: 'Style Identity Profiler',
      bullets: [
        'Feel (Polished / Magnetic / Easeful / Bold)',
        'Aesthetic, palette, lifestyle, fit preferences',
        'Results → user_style_profile, feed all AI recommendations',
        'Saved if logged in; anonymous if guest',
      ],
    },
    {
      label: 'INSPO',
      route: '/inspo',
      headline: 'Editorial Inspiration Feed',
      bullets: [
        'Magazine-style portrait cards with editorial captions',
        'Categories: Staples, Texture, Occasion, Workwear, Minimal',
        '"This Week" featured editorial + Trending dark card',
        'Each card links back into Find Look engine',
      ],
    },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            NO AUTH REQUIRED
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Guest Features
          </div>
        </div>

        {/* Feature rows */}
        <div className="flex flex-col" style={{ gap: '1.5vh', flex: 1 }}>
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-start"
              style={{
                background: '#1C1C1C',
                border: '0.08vh solid #2A2A2A',
                borderRadius: '0.6vw',
                padding: '1.8vh 2vw',
                gap: '2.5vw',
              }}
            >
              {/* Left: label + route */}
              <div style={{ minWidth: '14vw' }}>
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '0.4vh' }}>{f.label}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#CC1519' }}>{f.route}</div>
              </div>
              {/* Divider */}
              <div style={{ width: '0.08vw', background: '#2A2A2A', alignSelf: 'stretch' }} />
              {/* Right: headline + bullets */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '0.5vh' }}>{f.headline}</div>
                <div className="flex flex-wrap" style={{ gap: '0.3vh 1.5vw' }}>
                  {f.bullets.map((b, i) => (
                    <span key={i} style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999999' }}>
                      {i < f.bullets.length - 1 ? `${b} ·` : b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
