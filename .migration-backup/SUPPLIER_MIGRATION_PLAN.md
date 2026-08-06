# Supplier Portal Migration Plan

## Overview
Strategy for migrating existing `makers` table data to new `supplier_accounts` and `supplier_profiles` tables while preserving backward compatibility.

## Migration Strategy

### Phase 1: Dual Operation (Current)
- **Status**: Both `makers` and `supplier_accounts/supplier_profiles` tables exist
- **Goal**: Allow new suppliers to register while preserving existing maker functionality
- **Approach**:
  - Existing maker dashboard continues using `makers` table
  - New supplier portal uses `supplier_accounts` + `supplier_profiles`
  - No data migration yet - systems operate independently

### Phase 2: Data Migration (Future)
When ready to consolidate:

#### Step 1: Create Migration Script
```typescript
// server/migrate-makers-to-suppliers.ts
import { db } from './db';
import { makers, supplierAccounts, supplierProfiles } from '@shared/schema';
import bcrypt from 'bcrypt';

async function migrateMakersToSuppliers() {
  const allMakers = await db.select().from(makers);
  
  for (const maker of allMakers) {
    // CRITICAL: Check if password is already hashed
    let hashedPassword = maker.password;
    
    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    const isBcryptHash = /^\$2[aby]\$/.test(maker.password);
    
    if (!isBcryptHash) {
      console.error(`SECURITY VIOLATION: Maker ${maker.id} has plaintext password!`);
      throw new Error(`Cannot migrate maker ${maker.id}: password is not hashed. Run password-hashing migration first.`);
    }
    
    // Verify hash is valid bcrypt format (length ~60 chars)
    if (hashedPassword.length < 50) {
      console.error(`SECURITY VIOLATION: Maker ${maker.id} password appears invalid`);
      throw new Error(`Cannot migrate maker ${maker.id}: password hash appears invalid`);
    }
    
    // Create supplier account
    const [supplierAccount] = await db.insert(supplierAccounts).values({
      id: maker.id, // Preserve ID for data consistency
      email: maker.email,
      password: hashedPassword, // Verified bcrypt hash
      role: 'tailor', // All makers become tailors
      tier: maker.subscriptionTier === 'elite' ? 'pro' : 'basic',
      businessName: maker.businessName,
      ownerName: maker.ownerName,
      isVerified: maker.isVerified,
      isActive: maker.isActive,
      stripeAccountId: maker.stripeAccountId,
      createdAt: maker.createdAt,
      updatedAt: maker.updatedAt,
    }).returning();

    // Create supplier profile
    await db.insert(supplierProfiles).values({
      supplierId: supplierAccount.id,
      description: maker.description,
      location: maker.location,
      specialties: maker.specialties,
      styleTags: maker.styleTags,
      budgetMin: maker.budgetMin,
      budgetMax: maker.budgetMax,
      deliveryZones: maker.deliveryZones,
      leadTimeDays: maker.leadTimeDays,
      portfolioImages: maker.portfolioImages,
      rating: maker.rating,
      totalReviews: maker.totalReviews,
      ecommercePlatform: 'manual',
      catalogSyncEnabled: false,
    });
  }
  
  console.log(`Migrated ${allMakers.length} makers to supplier accounts`);
}
```

#### Step 2: Update Foreign Keys
Update `quotes` and `orders` tables to reference `supplier_accounts` instead of `makers`:
- Add `supplierId` column to `quotes` and `orders`
- Backfill with `makerId` values
- Update API routes to use `supplierId`
- Soft-delete `makerId` columns (keep for rollback)

#### Step 3: Validation
```typescript
async function validateMigration() {
  const makerCount = await db.select({ count: sql`count(*)` }).from(makers);
  const supplierCount = await db.select({ count: sql`count(*)` })
    .from(supplierAccounts)
    .where(eq(supplierAccounts.role, 'tailor'));
  
  console.log(`Makers: ${makerCount}, Tailors: ${supplierCount}`);
  // Should match!
}
```

#### Step 4: Rollback Strategy
If migration fails:
1. Keep `makers` table intact
2. Drop supplier_accounts/supplier_profiles for migrated IDs
3. Restore maker dashboard functionality
4. Investigate and fix issues

### Phase 3: Deprecation (Future)
After successful migration and testing:
1. Mark `makers` table as deprecated in schema
2. Archive maker dashboard code
3. Redirect maker login to supplier portal
4. Eventually drop `makers` table after 6+ months

## Security Implementation

### Password Hashing (Already Implemented)
```typescript
import bcrypt from 'bcrypt';

// On registration/password update
const hashedPassword = await bcrypt.hash(plainPassword, 10);
await db.insert(supplierAccounts).values({
  ...data,
  password: hashedPassword
});

// On login
const supplier = await db.select().from(supplierAccounts)
  .where(eq(supplierAccounts.email, email));
const isValid = await bcrypt.compare(plainPassword, supplier.password);
```

### Token Encryption (CRITICAL - Wire into API layer)

**Step 1: Create encryption service**
```typescript
// server/services/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.INTEGRATION_TOKEN_KEY; // Must be 32 bytes
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY).length !== 32) {
  throw new Error('INTEGRATION_TOKEN_KEY must be exactly 32 bytes');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

**Step 2: Use in API routes (MANDATORY)**
```typescript
// server/routes.ts - Integration token storage
import { encrypt, decrypt } from './services/encryption';

// When saving integration tokens
app.post('/api/v1/supplier/integrations', async (req, res) => {
  const { platform, accessToken, refreshToken } = req.body;
  
  const encrypted = await db.insert(integrationTokens).values({
    supplierId: req.supplierId,
    platform,
    accessToken: encrypt(accessToken), // CRITICAL: Encrypt before storage
    refreshToken: refreshToken ? encrypt(refreshToken) : null,
    // ...other fields
  });
});

// When retrieving tokens
app.get('/api/v1/supplier/integrations/:id', async (req, res) => {
  const token = await db.select().from(integrationTokens)
    .where(eq(integrationTokens.id, req.params.id));
  
  return {
    ...token,
    accessToken: decrypt(token.accessToken), // Decrypt for use
    refreshToken: token.refreshToken ? decrypt(token.refreshToken) : null,
  };
});
```

**Step 3: Environment setup**
```bash
# Generate a secure 32-byte key
node -e "console.log(crypto.randomBytes(32).toString('hex'))"

# Add to .env
INTEGRATION_TOKEN_KEY=<generated-key-here>
```

## Performance Optimization

### Indexes to Add (via raw SQL or migration)
```sql
-- High-volume foreign keys
CREATE INDEX idx_retailer_products_supplier_id ON retailer_products(supplier_id);
CREATE INDEX idx_supplier_messages_thread_id ON supplier_messages(thread_id);
CREATE INDEX idx_supplier_orders_supplier_id ON supplier_orders(supplier_id);

-- Time-series queries
CREATE INDEX idx_analytics_snapshots_supplier_date ON analytics_snapshots(supplier_id, snapshot_date DESC);
CREATE INDEX idx_supplier_messages_created_at ON supplier_messages(created_at DESC);

-- Lookup optimizations
CREATE INDEX idx_integration_tokens_platform ON integration_tokens(supplier_id, platform);
CREATE INDEX idx_message_threads_status ON message_threads(supplier_id, status);
```

## Data Integrity Checks

### Pre-Migration Validation (REQUIRED - Run before migration)
```typescript
async function validateMakerPasswords() {
  const allMakers = await db.select().from(makers);
  let invalidCount = 0;
  
  for (const maker of allMakers) {
    const isBcryptHash = /^\$2[aby]\$/.test(maker.password);
    if (!isBcryptHash || maker.password.length < 50) {
      console.error(`❌ Maker ${maker.id} (${maker.email}) has invalid password hash`);
      invalidCount++;
    }
  }
  
  if (invalidCount > 0) {
    throw new Error(`BLOCKED: ${invalidCount} makers have plaintext or invalid passwords. Fix before migration.`);
  }
  
  console.log(`✅ All ${allMakers.length} maker passwords are properly hashed`);
}
```

Checklist:
- [ ] Run validateMakerPasswords() - must pass 100%
- [ ] All maker emails are unique (enforced by schema)
- [ ] No orphaned quotes or orders
- [ ] Stripe account IDs are valid format
- [ ] **If any passwords are plaintext, STOP and hash them first**

### Post-Migration Validation
- [ ] Maker count == Tailor supplier count
- [ ] All quotes have valid supplier references
- [ ] All orders have valid supplier references
- [ ] No data loss in profiles
- [ ] Authentication works for migrated accounts

## Timeline (Proposed)

1. **Current State**: Dual operation, no migration
2. **Week 1-2**: Build supplier portal MVP (basic auth, dashboard)
3. **Week 3**: Test migration script in development
4. **Week 4**: Run migration on staging
5. **Week 5**: Validate and fix issues
6. **Week 6+**: Production migration (off-peak hours)

## Rollback Triggers

Immediately rollback if:
- Authentication fails for >5% of migrated accounts
- Data loss detected in any table
- Critical foreign key violations
- Stripe integration breaks
- Existing maker dashboard stops working
