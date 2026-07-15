# Plan: Complete Admin Vehicle Form + Brand-Wise Grouping + Delete Confirmation

## Summary

The admin vehicle form is missing 5 field groups that appear on the public vehicle detail page: multi-image gallery (`images`), EV `range`, full `specs` object (20 fields), `mileage`, and `exportDocs`. The admin vehicles list is a flat table with no brand grouping and uses native `confirm()` for deletes. This plan completes the form, restructures the list into expandable brand groups with per-brand "Add" buttons, and replaces the native confirm with a proper modal popup.

## Current State Analysis

### What the form has (VehicleForm.tsx — 17 fields)
brand, model, year, price, fuel, bodyType, transmission, condition, availability, image (single URL), badge, engine, description, features (textarea), colors (comma-separated), fobPrice, portOfLoading, handDrive, shippingEstimate

### What the form is MISSING (5 field groups, ~25 fields)
The Vehicle type (`src/types/index.ts`) and the API (`/api/vehicles` POST) both support these, and the detail page (`VehicleDetailClient.tsx`) displays them — but the form doesn't expose them:

1. **`images` (string array)** — multi-image carousel on detail page. Form only has single `image`.
2. **`range` (string)** — EV range shown on cards + detail quick-specs.
3. **`specs` (VehicleSpecs object, 20 fields)** — power, torque, acceleration, topSpeed, range, fuelEconomy, batteryCapacity, chargingTime, engineDisplacement, drivetrain, length, width, height, wheelbase, weight, seatingCapacity, bootSpace, payloadCapacity, cargoVolume. All shown in the detail page spec table.
4. **`mileage` (number)** — for used vehicles.
5. **`exportDocs` (string array)** — export documentation list shown on detail page.

### Admin vehicles page issues (`src/app/admin/vehicles/page.tsx`)
- Flat table: Vehicle | Price | Status | Actions
- No brand grouping — user wants expandable brand sections
- Delete uses `confirm()` (native browser dialog) — user wants a proper modal popup
- No per-brand "Add Vehicle" shortcut

### API already handles everything
`/api/vehicles` POST already accepts and stores: `images`, `specs`, `mileage`, `exportDocs`, `range` (via specs). The PUT route (`/api/vehicles/[id]`) does full updates. No API changes needed — only the form UI is incomplete.

## Proposed Changes

### 1. Complete VehicleForm with all detail-page fields
**File:** `src/components/admin/VehicleForm.tsx`

Add the missing fields, organized into collapsible sections to keep the form manageable:

**Section A — Basic Info (existing, unchanged):**
brand, model, year, fuel, bodyType, transmission, condition, availability, badge

**Section B — Pricing (existing + nothing new):**
price, fobPrice

**Section C — Images (expand existing):**
- `image` (existing — main thumbnail)
- `images` (NEW — textarea, one URL per line, for the detail page carousel)

**Section D — Performance & Specs (NEW — collapsible):**
- `range` (NEW — EV range, e.g. "600 km")
- `mileage` (NEW — for used vehicles)
- `engine` (existing)
- Full `specs` object (NEW — 20 fields grouped):
  - Performance: power, torque, acceleration, topSpeed
  - EV-specific: batteryCapacity, chargingTime
  - Fuel-specific: fuelEconomy, engineDisplacement
  - Drivetrain: drivetrain (select: FWD/RWD/AWD/4x4/4x2)
  - Dimensions: length, width, height, wheelbase, weight
  - Capacity: seatingCapacity (number), bootSpace, payloadCapacity, cargoVolume

**Section E — Export Info (existing + new):**
- portOfLoading, handDrive, shippingEstimate (existing)
- `exportDocs` (NEW — textarea, one doc per line)

**Section F — Description, Features & Colors (existing):**
- description, features, colors

**Implementation:**
- Add `specs` object to `VehicleData` interface (all fields optional strings, `seatingCapacity` as number)
- Add `images` array, `range` string, `mileage` number, `exportDocs` array to interface
- Add textarea for `images` (one URL per line, same pattern as existing `features`)
- Add textarea for `exportDocs` (one per line)
- Add collapsible `<details>` sections for Specs and Export to keep form scannable
- In `handleSubmit`: build `specs` object from individual fields, `images` from textarea split, `exportDocs` from textarea split
- Pre-fill all new fields when editing (parse from `initialData.specs`, `initialData.images`, etc.)

### 2. Brand-wise grouping in admin vehicles list
**File:** `src/app/admin/vehicles/page.tsx`

Replace the flat table with expandable brand sections:

- Group vehicles by brand (using `BRAND_LIST` from `src/lib/brands.ts` as the source of brand names + categories)
- Show brand logo + name + car count as a collapsible header row
- Click to expand → shows that brand's vehicles in a sub-table
- Each brand section has its own "Add [Brand] Vehicle" button that links to `/admin/vehicles/new?brand=BYD` (pre-fills brand)
- Brands with 0 vehicles still show (greyed out) so admin can add the first car
- Group brands by category: Chinese, Foreign, Trucks (matching `/brands` page)

**VehicleForm pre-fill:**
- `src/app/admin/vehicles/new/page.tsx` reads `?brand=` query param and passes it as `initialData.brand`
- `src/components/admin/VehicleForm.tsx` — no change needed, already accepts `initialData`

### 3. Delete confirmation modal
**File:** `src/app/admin/vehicles/page.tsx` (and `src/components/admin/CrudPage.tsx`)

Replace native `confirm()` with a proper modal popup:

- Add `deleteTarget` state (the vehicle id + name being deleted)
- When delete button clicked → set `deleteTarget` instead of immediate delete
- Render a modal overlay with:
  - Warning icon (red)
  - "Delete Vehicle" title
  - "Are you sure you want to delete {brand} {model}? This action cannot be undone."
  - "Cancel" button (gray) + "Delete" button (red)
- On "Delete" → call DELETE API, remove from state, close modal
- On "Cancel" → close modal, no action

Also apply the same modal pattern to `CrudPage.tsx` (used by gallery, testimonials, etc.) — replace its `confirm()` call with the same modal component.

**Extract reusable ConfirmDialog component:**
- Create `src/components/admin/ConfirmDialog.tsx` — small reusable modal
- Props: `open`, `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`
- Used by both `admin/vehicles/page.tsx` and `CrudPage.tsx`

## Files to Create/Modify

| File | Action | Purpose |
|---|---|---|
| `src/components/admin/VehicleForm.tsx` | Modify | Add images, range, mileage, specs (20 fields), exportDocs |
| `src/app/admin/vehicles/page.tsx` | Modify | Brand grouping + delete modal |
| `src/app/admin/vehicles/new/page.tsx` | Modify | Read `?brand=` query param, pass to form |
| `src/components/admin/ConfirmDialog.tsx` | Create | Reusable delete confirmation modal |
| `src/components/admin/CrudPage.tsx` | Modify | Use ConfirmDialog instead of `confirm()` |

## Assumptions & Decisions

1. **All specs fields are optional** — admin can fill what they know; empty fields show "—" on the detail page (existing behavior). This avoids forcing admin to fill 20 fields for every car.
2. **Collapsible sections** — use native `<details>`/`<summary>` HTML elements (no JS state needed, accessible, zero dependencies). Specs and Export sections default to collapsed.
3. **Images textarea** — one URL per line, same pattern as the existing `features` field. Admin pastes Cloudinary URLs or local paths.
4. **Brand grouping shows ALL brands** (even with 0 cars) so admin can add the first car for any brand. Brands are grouped by category (Chinese / Foreign / Trucks) with section headers.
5. **Delete modal is reusable** — extracted to `ConfirmDialog.tsx` so both the vehicles page and the generic CrudPage use it.
6. **No API changes** — the POST/PUT routes already accept all fields. Only the form needs to send them.
7. **No schema changes** — all columns already exist in the `vehicles` table.

## Verification Steps

1. Go to `/admin/vehicles/new` — form should show all sections (Basic, Pricing, Images, Specs, Export, Description)
2. Fill in a few specs fields + add 3 image URLs → save → visit `/inventory/[slug]` → detail page should show the gallery carousel + filled specs
3. Edit an existing vehicle — all fields should pre-fill correctly (including specs, images, exportDocs)
4. Go to `/admin/vehicles` — should see brand-grouped expandable sections with car counts
5. Click a brand → expands to show that brand's cars
6. Click "Add [Brand] Vehicle" → form opens with brand pre-selected
7. Click delete on any vehicle → modal popup appears with vehicle name → Cancel does nothing → Delete removes the vehicle
8. Test on mobile — brand sections should stack, modal should be centered
