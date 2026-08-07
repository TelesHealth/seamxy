export default function DatabaseSchema() {
  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ background: '#111111' }}>
      <div className="absolute top-0 left-0 right-0" style={{ height: '0.4vh', background: '#CC1519' }} />

      <div className="absolute inset-0 flex flex-col" style={{ padding: '5vh 7vw 4vh' }}>
        {/* Header */}
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.4vw', letterSpacing: '0.25em', color: '#CC1519', fontWeight: 500, marginBottom: '1vh' }}>
            NEON POSTGRESQL · DRIZZLE ORM · lib/db/src/schema/schema.ts
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '4.2vw', fontWeight: 700, color: '#FAF6F2', lineHeight: 1.05 }}>
            Database &amp; Schema
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2vw', flex: 1 }}>

          {/* Left: Core tables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.2vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '0.8vh' }}>
                CORE TABLES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9vh' }}>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>users</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>id, email, bcrypt hash, role, stripe_customer_id</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>measurements</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>height, chest, waist, hips, inseam, foot_size</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>subscriptions</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>user_id, stripe_id, plan, status, period_end</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>products</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>name, brand, price, category, retailer, affiliate_url</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>orders</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>user_id, maker_id, status, amount, stripe_payment_id</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>makers</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>name, specialty, bio, verified, location</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>custom_requests</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>user_id, description, budget, status, photos</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>quotes</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>request_id, maker_id, amount, accepted_at</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>audit_logs</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>admin_id, action, entity, before/after JSON</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.2vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '0.8vh' }}>
                AI &amp; CREATOR TABLES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9vh' }}>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>ai_personas</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>name, style_philosophy, system_prompt</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>ai_chat_sessions</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>user_id, persona_id, history JSONB, created_at</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>stylist_profiles</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>handle, bio, specialties, verified, revenue_split</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>creator_posts</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>stylist_id, content, tier_required, published_at</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>affiliate_clicks</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>user_id, product_id, retailer, clicked_at</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Supplier tables + auth tracks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.2vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '0.8vh' }}>
                SUPPLIER TABLES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9vh' }}>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>supplier_accounts</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>email, role (retailer/tailor/designer), tier</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>supplier_profiles</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>account_id, brand, description, ai_training JSON</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>retailer_products</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>supplier_id, sku, price, inventory_count</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>integration_tokens</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>supplier_id, platform (Shopify/WooCommerce), token</span>
                </div>
                <div style={{ display: 'flex', gap: '1vw', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.45vw', color: '#CC1519', minWidth: '14vw' }}>supplier_orders</span>
                  <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>order_id, supplier_id, fulfillment_status</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', letterSpacing: '0.12em', color: '#CC1519', fontWeight: 600, marginBottom: '1.2vh', borderBottom: '0.08vh solid #2A2A2A', paddingBottom: '0.8vh' }}>
                THREE AUTH TRACKS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.2vh 1.5vw' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '0.4vh' }}>
                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Customer</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#555' }}>/api/v1/auth/*</span>
                  </div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>users table · session cookie · requireUser middleware</div>
                </div>
                <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.2vh 1.5vw' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '0.4vh' }}>
                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Supplier</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#555' }}>/api/v1/supplier/*</span>
                  </div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>supplier_accounts table · authenticateSupplier middleware</div>
                </div>
                <div style={{ background: '#1C1C1C', border: '0.08vh solid #2A2A2A', borderRadius: '0.5vw', padding: '1.2vh 1.5vw' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1vw', marginBottom: '0.4vh' }}>
                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.5vw', fontWeight: 600, color: '#FAF6F2' }}>Admin</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.3vw', color: '#555' }}>/api/v1/admin/*</span>
                  </div>
                  <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.3vw', color: '#666' }}>admin_users table · requireAdmin middleware · full audit log</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '0.4vh', background: '#1C1C1C' }} />
    </div>
  );
}
