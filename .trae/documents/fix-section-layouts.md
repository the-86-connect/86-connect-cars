# Fix FAQ, Contact, and Footer Section Layouts

## Summary
Fix structural layout issues in FAQ, Contact, and Footer sections that create awkward gaps and poor visual balance on desktop view.

## Current State Analysis

### FAQ Section (`src/components/sections/FAQ.tsx`)
- **Problem**: Left column has SectionHeading + small CTA card, right column has tall Accordion
- **Issue**: CTA card doesn't fill vertical space, creating large empty gap below it
- **Gap**: Uses `gap-12 lg:gap-16` (48px/64px) which is excessive

### Contact Section (`src/components/sections/Contact.tsx`)
- **Problem**: Left column stacks SectionHeading + 3 contact cards + 3 stat badges
- **Issue**: Elements don't align well with the QuoteForm card on the right
- **Gap**: Uses `gap-12 lg:gap-16` (48px/64px) which is excessive

### Footer (`src/components/layout/Footer.tsx`)
- **Problem**: Has redundant "Quick Quote" widget that duplicates the Contact section
- **Issue**: Creates visual noise and confusion (why two quote CTAs?)
- **Gap**: Main content uses `py-10` which is reasonable, but the redundant widget adds unnecessary height

## Proposed Changes

### 1. FAQ Section
**File**: `src/components/sections/FAQ.tsx`

**Changes**:
- Reduce gap from `gap-12 lg:gap-16` to `gap-8 lg:gap-12`
- Add `items-start` to the grid to prevent stretching
- Move the CTA card to be positioned at the bottom of the left column using flexbox
- Add `flex-1` to the accordion wrapper to ensure it fills available space

**Implementation**:
```tsx
<div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
  <motion.div className="flex flex-col">
    <SectionHeading ... />
    <div className="glass-card mt-auto rounded-3xl p-6 sm:p-8">
      {/* CTA content */}
    </div>
  </motion.div>
  <motion.div>
    <Accordion items={faqs} />
  </motion.div>
</div>
```

### 2. Contact Section
**File**: `src/components/sections/Contact.tsx`

**Changes**:
- Reduce gap from `gap-12 lg:gap-16` to `gap-8 lg:gap-12`
- Add `items-start` to the grid
- Reduce spacing between contact info cards from `gap-4` to `gap-3`
- Reduce spacing between stats from `gap-3` to `gap-2`
- Reduce top margin on contact info section from `mt-10` to `mt-8`
- Reduce top margin on stats section from `mt-8` to `mt-6`

**Implementation**:
```tsx
<div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
  <motion.div className="flex flex-col">
    <SectionHeading ... />
    <div className="mt-8 flex flex-col gap-3">
      {/* contact cards */}
    </div>
    <motion.div className="mt-6 flex flex-wrap gap-2">
      {/* stats */}
    </motion.div>
  </motion.div>
  <motion.div>
    <div className="glass-card rounded-3xl p-6 sm:p-8">
      <QuoteForm ... />
    </div>
  </motion.div>
</div>
```

### 3. Footer
**File**: `src/components/layout/Footer.tsx`

**Changes**:
- Remove the entire "Quick Quote Widget" section (lines 123-152)
- This eliminates redundancy with the Contact section
- Reduces footer height and visual clutter

**Implementation**:
Delete the entire `<motion.div>` block containing the "Get a Free Quote" widget.

## Assumptions & Decisions

1. **Gap reduction**: Using `gap-8 lg:gap-12` (32px/48px) instead of `gap-12 lg:gap-16` (48px/64px) for tighter, more professional spacing
2. **Vertical alignment**: Using `items-start` prevents grid items from stretching, allowing natural content height
3. **FAQ CTA positioning**: Using `mt-auto` pushes the CTA card to the bottom, creating better visual balance with the accordion
4. **Footer widget removal**: The "Quick Quote" widget is redundant since we already have a full Contact section with a quote form
5. **Contact info spacing**: Tighter spacing (gap-3 instead of gap-4) makes the section more compact

## Verification Steps

1. Open http://localhost:3000
2. Scroll to FAQ section - verify CTA card is at bottom of left column, no large gaps
3. Scroll to Contact section - verify tighter spacing, better alignment with form
4. Scroll to Footer - verify "Quick Quote" widget is gone, only 4-column grid remains
5. Check responsive behavior at mobile/tablet breakpoints
6. Verify dark mode still works correctly (text visible on elevated background)
