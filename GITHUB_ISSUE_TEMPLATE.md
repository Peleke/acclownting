# GitHub Issue: Run Report Button Fails - Silent Supabase RPC Failure

## Title
Bug: Run Report button fails to display data - silent Supabase RPC failure due to malformed environment variables

## Issue Description
The "Run Report" button on the Reports page fails silently. When users click the button after selecting a date range, the page navigates to `/reports?start=XXXX&end=XXXX` but displays empty data ($0 for all values) instead of the actual revenue report.

## Expected Behavior
After clicking "Run Report" with valid date ranges, the page should display:
- Total Invoiced amount
- Total Paid amount
- Outstanding amount
- Client balances table

## Actual Behavior
Page navigates but displays $0 for all values and empty client balances table

## Root Cause
**Malformed Supabase environment variables** in `.env.local`:
- The SUPABASE_URL, ANON_KEY, and SERVICE_ROLE_KEY contained literal `\n` characters at the end
- This caused Supabase client initialization to fail silently
- RPC calls would fail and return null data without throwing errors
- Errors were not surfaced, making debugging difficult

### Malformed Example:
```
NEXT_PUBLIC_SUPABASE_URL="https://abrfiahrbxffnrznycev.supabase.co\n"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_KGqGAhx_IZy8185jbqGeWA_p_wtStNb\n"
```

## Solution Implemented
1. **Fixed environment variables** - Removed literal `\n` from all Supabase config values
2. **Added error handling** - Added proper error destructuring and logging to:
   - `src/app/(protected)/reports/page.tsx`
   - `src/app/(protected)/dashboard/page.tsx`
3. **Added tests** - Created `src/tests/unit/supabase-rpc-error-handling.test.ts` to prevent regression

## Files Changed
- `src/app/(protected)/reports/page.tsx` - Added error handling for RPC calls
- `src/app/(protected)/dashboard/page.tsx` - Added error handling for RPC calls  
- `src/tests/unit/supabase-rpc-error-handling.test.ts` - New test suite
- `BUG_REPORT_RUN_REPORT.md` - Detailed bug analysis

## How to Fix
### Step 1: Fix .env.local
Ensure all Supabase configuration variables are properly formatted without trailing characters:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://abrfiahrbxffnrznycev.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_KGqGAhx_IZy8185jbqGeWA_p_wtStNb"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_nLMqWvOvaQKXeWj3mwdY9Q_BRmW6t69"
```

### Step 2: Rebuild and test
```bash
npm run build
npm run dev
```

## Testing
- ✓ All unit tests pass (208 tests)
- ✓ ReportFilters component correctly submits with proper URL params
- ✓ Reports page correctly reads query parameters
- ✓ With fixed env vars, RPC calls succeed
- ✓ Error handling properly logs failures to console

## Prevention
- Environment variables are now validated through tests
- RPC errors are explicitly destructured and logged
- Dashboard and Reports pages have consistent error handling

## Related
- Environment variable configuration format
- Supabase client initialization
- RPC error handling patterns

## Labels
- `bug` 
- `supabase`
- `environment-config`
- `error-handling`

## Assignee
@Peleke
