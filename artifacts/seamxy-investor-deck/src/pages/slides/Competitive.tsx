export default function Competitive() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg flex flex-col" style={{ paddingLeft: '7vw', paddingRight: '7vw', paddingTop: '9vh', paddingBottom: '7vh' }}>
      {/* Header */}
      <div className="flex items-center gap-[2vw] mb-[3vh]">
        <div className="bg-accent" style={{ height: '0.25vh', width: '3vw' }} />
        <p className="font-body text-accent uppercase tracking-widest" style={{ fontSize: '1.1vw', letterSpacing: '0.25em' }}>Competitive Landscape</p>
      </div>

      <h2
        className="font-display font-bold text-primary mb-[4vh]"
        style={{ fontSize: '3.8vw', lineHeight: 1.05 }}
      >
        No one else connects all the dots.
      </h2>

      {/* Comparison table */}
      <div className="flex-1 flex flex-col">
        {/* Header row */}
        <div
          className="flex rounded-t-[0.8vw]"
          style={{ background: '#111111', padding: '1.5vh 1.5vw' }}
        >
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body font-semibold text-bg" style={{ fontSize: '1.3vw' }}>Feature</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.3vw' }}>SeamXY</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.7)' }}>Stitch Fix</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.7)' }}>Lookbook</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.7)' }}>Stylebook</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body" style={{ fontSize: '1.3vw', color: 'rgba(250,249,246,0.7)' }}>Pinterest</p>
          </div>
        </div>

        {/* Data rows */}
        {/* Row 1 */}
        <div className="flex items-center" style={{ padding: '1.4vh 1.5vw', borderBottom: '0.1vw solid #E8E4E0' }}>
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body text-primary" style={{ fontSize: '1.35vw' }}>AI outfit recommendations</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex items-center" style={{ padding: '1.4vh 1.5vw', background: '#F7F4F0', borderBottom: '0.1vw solid #E8E4E0' }}>
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body text-primary" style={{ fontSize: '1.35vw' }}>Virtual try-on</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex items-center" style={{ padding: '1.4vh 1.5vw', borderBottom: '0.1vw solid #E8E4E0' }}>
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body text-primary" style={{ fontSize: '1.35vw' }}>Closet management OS</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
        </div>

        {/* Row 4 */}
        <div className="flex items-center" style={{ padding: '1.4vh 1.5vw', background: '#F7F4F0', borderBottom: '0.1vw solid #E8E4E0' }}>
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body text-primary" style={{ fontSize: '1.35vw' }}>Social / community layer</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
        </div>

        {/* Row 5 */}
        <div className="flex items-center" style={{ padding: '1.4vh 1.5vw', borderBottom: '0.1vw solid #E8E4E0' }}>
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body text-primary" style={{ fontSize: '1.35vw' }}>Gig economy (tailors)</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
        </div>

        {/* Row 6 */}
        <div className="flex items-center rounded-b-[0.8vw]" style={{ padding: '1.4vh 1.5vw', background: '#F7F4F0' }}>
          <div style={{ flex: '2', paddingRight: '1vw' }}>
            <p className="font-body text-primary" style={{ fontSize: '1.35vw' }}>Guest access (no account)</p>
          </div>
          <div className="text-center" style={{ flex: '1.3' }}>
            <p className="font-body font-semibold text-accent" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>—</p>
          </div>
          <div className="text-center" style={{ flex: '1' }}>
            <p className="font-body text-muted" style={{ fontSize: '1.45vw' }}>✓</p>
          </div>
        </div>
      </div>
    </div>
  );
}
