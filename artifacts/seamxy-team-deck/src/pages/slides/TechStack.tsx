export default function TechStack() {
  const rows = [
    { layer: 'Frontend', tech: 'React 18 + Wouter + TanStack Query + Tailwind CSS + shadcn/ui' },
    { layer: 'State (try-on)', tech: 'Zustand' },
    { layer: 'Backend', tech: 'Express.js + TypeScript (~4,700 line routes.ts)' },
    { layer: 'Database', tech: 'PostgreSQL via Neon — serverless, auto-scaled' },
    { layer: 'ORM', tech: 'Drizzle ORM — schema-first, type-safe queries' },
    { layer: 'AI', tech: 'Anthropic Claude claude-opus-4-5 via Tool Use API' },
    { layer: 'File Storage', tech: 'AWS S3 — closet photos, try-on images, maker portfolios' },
    { layer: 'Payments', tech: 'Stripe — subscriptions, webhooks, checkout sessions' },
    { layer: 'Pose Detection', tech: 'MediaPipe — 33 body landmark model, runs client-side' },
    { layer: 'Warping Engine', tech: 'TPS (Thin Plate Spline) — custom implementation' },
    { layer: 'Auth / Security', tech: 'Bcrypt password hashing · AES-256-CBC · RBAC middleware' },
    { layer: 'Fonts', tech: 'Cormorant Garamond (display) · Inter (body)' },
  ];

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            STACK REFERENCE
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Tech Stack
          </div>
        </div>

        {/* Table header */}
        <div className="flex" style={{ borderBottom: '0.1vh solid #CC1519', paddingBottom: '1.2vh', marginBottom: '0.5vh' }}>
          <div style={{ width: '22vw', fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>LAYER</div>
          <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#CC1519', fontWeight: 600, letterSpacing: '0.1em' }}>TECHNOLOGY</div>
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={row.layer}
            className="flex items-center"
            style={{
              padding: '1.1vh 0',
              borderBottom: '0.08vh solid #1A1A1A',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
            }}
          >
            <div style={{ width: '22vw' }}>
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>{row.layer}</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#AAAAAA' }}>{row.tech}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
