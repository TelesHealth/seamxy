export default function TryOnArch() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3.5vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            MEDIAPIPE · TPS WARPING · AR
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Virtual Try-On Architecture
          </div>
        </div>

        {/* 3-step pipeline */}
        <div className="flex items-stretch" style={{ gap: '1.5vw', marginBottom: '2.5vh' }}>

          {/* Step 1: Upload */}
          <div style={{ flex: 1, background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', borderTop: '0.4vh solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh' }}>01 · UPLOAD</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '1.5vh' }}>Photo & Pose Detection</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Upload own photo or select body model</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>MediaPipe identifies 33 body landmarks</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Height calibration modal for accurate scale</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Stored in try_on_sessions table</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center" style={{ color: '#CC1519', fontSize: '3vw', fontWeight: 300 }}>→</div>

          {/* Step 2: Studio */}
          <div style={{ flex: 1, background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', borderTop: '0.4vh solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh' }}>02 · STUDIO</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '1.5vh' }}>TPS Warping Canvas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>TPS (Thin Plate Spline) deformation to body shape</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Layer controls: position, scale, rotation, opacity</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Stack multiple garments — head-to-toe looks</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Size recommendation with fit confidence score</div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center" style={{ color: '#CC1519', fontSize: '3vw', fontWeight: 300 }}>→</div>

          {/* Step 3: Share */}
          <div style={{ flex: 1, background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.6vw', padding: '2.5vh 2vw', borderTop: '0.4vh solid #CC1519' }}>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.5vh' }}>03 · SHARE</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2vw', fontWeight: 600, color: '#FAF6F2', marginBottom: '1.5vh' }}>Social Proof Loop</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8vh' }}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Generate unique share token link</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Public view: /try-on/shared/:code</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Recipients vote on the look</div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999' }}>Social proof drives purchase decisions</div>
            </div>
          </div>

        </div>

        {/* AR Mode */}
        <div style={{ background: '#1A1212', border: '0.08vh solid #3A2020', borderRadius: '0.6vw', padding: '2vh 2.5vw', display: 'flex', alignItems: 'center', gap: '3vw' }}>
          <div>
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '0.6vh' }}>AR MODE · /ar-try-on</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2vw', fontWeight: 600, color: '#FAF6F2' }}>Live Camera Overlay</div>
          </div>
          <div style={{ width: '0.08vw', background: '#3A2020', alignSelf: 'stretch' }} />
          <div style={{ flex: 1, fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', color: '#999', lineHeight: 1.6 }}>
            Real-time garment overlay using device webcam. Pose detection runs continuously via MediaPipe for live landmark tracking. Garments rendered at scale in real time.
          </div>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#555', textAlign: 'right' }}>
            <div style={{ color: '#FAF6F2', fontSize: '1.5vw', fontWeight: 600, marginBottom: '0.4vh' }}>State: Zustand</div>
            <div>try-on component suite</div>
            <div style={{ fontFamily: 'monospace', color: '#CC1519', fontSize: '1.3vw' }}>components/try-on/</div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
