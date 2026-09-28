"use client";

export function PlanSection({ onSwitchOffer }: { onSwitchOffer: () => void }) {
  return (
    <div className="space-y-8 text-[14.5px] leading-relaxed text-[#0f1419]">
      {/* Nav buttons — always visible at top */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSwitchOffer}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e8442a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c53922] transition-colors"
        >
          💼 Back to the offer →
        </button>
      </div>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">1 · Decision summary</h2>
        <p className="mb-3">
          Do <b>not</b> build a parallel <code className="rounded bg-[#fdeeea] px-1.5 py-0.5 text-[#8a2413] font-mono text-[13px]">motorcycles</code> system. Add <b>one discriminator column</b> (<code className="rounded bg-[#fdeeea] px-1.5 py-0.5 text-[#8a2413] font-mono text-[13px]">vehicle_type</code>) to the existing data model, then expose cars and bikes through <b>separate routes, sections, and admin pages</b> that <b>reuse the same components</b>.
        </p>
        <ul className="space-y-2 pl-5 list-disc marker:text-[#e8442a]">
          <li>Same database, same API, same admin form, same quote/WhatsApp flow.</li>
          <li>Different URLs, different homepage sections, different nav entries.</li>
          <li>One code path → half the maintenance, no duplicated 2,000-line inventory component.</li>
        </ul>
        <div className="mt-4 rounded-xl border border-[#e5e9ee] border-l-4 border-l-[#e8442a] bg-[#fbfcfd] p-4 text-sm">
          <b>Rejected alternative:</b> a second <code className="rounded bg-[#fdeeea] px-1 font-mono">motorcycles</code> table + parallel pages. It duplicates the catalogue UI, detail page, admin CRUD, and API routes — roughly 2× the work for identical behaviour.
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">2 · What already exists</h2>
        <div className="overflow-hidden rounded-xl border border-[#e5e9ee]">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fbfcfd]">
              <tr className="text-[10px] uppercase tracking-wider text-[#5b6672]">
                <th className="text-left px-3 py-2 font-semibold">Area</th>
                <th className="text-left px-3 py-2 font-semibold">File</th>
                <th className="text-left px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Quote → main admin", "forwardToMainAdmin() in api/quotes/route.ts", "Webhook POST to MAIN_ADMIN_CAR_QUOTE_API (admin.the86connect.com); submissionType: car-quote; vehicleLink hardcoded /inventory/<slug>"],
                ["Email system", "src/lib/email.ts (Resend)", "User confirmation + admin notification (eightysixconnect@outlook.com); vehicle links hardcoded /inventory/<slug>"],
                ["Order tracking", "quotes.delivery_status + account page", "Main admin updates status via PATCH webhook; users track from account page"],
              ].map(([a, f, n]) => (
                <tr key={a} className="border-t border-[#e5e9ee]">
                  <td className="px-3 py-2 font-semibold">{a}</td>
                  <td className="px-3 py-2 font-mono text-[12px] text-[#333c46]">{f}</td>
                  <td className="px-3 py-2 text-[#5b6672]">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">3 · Target public structure</h2>
        <div className="overflow-hidden rounded-xl border border-[#e5e9ee]">
          <table className="w-full text-sm">
            <thead className="bg-[#fbfcfd]">
              <tr className="text-[10px] uppercase tracking-wider text-[#5b6672]">
                <th className="text-left px-3 py-2 font-semibold">Concept</th>
                <th className="text-left px-3 py-2 font-semibold">Cars</th>
                <th className="text-left px-3 py-2 font-semibold">Bikes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Catalogue", "/cars", "/bikes"],
                ["Product detail", "/cars/[slug]", "/bikes/[slug]"],
                ["Brand listing", "/cars/brands", "/bikes/brands"],
                ["Homepage featured", "Featured Cars", "Featured Bikes"],
                ["Homepage brands", "Car Brands", "Bike Brands"],
              ].map(([c, cars, bikes]) => (
                <tr key={c} className="border-t border-[#e5e9ee]">
                  <td className="px-3 py-2 font-semibold">{c}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">{cars}</td>
                  <td className="px-3 py-2 font-mono text-[12px]">{bikes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm"><b>Redirects:</b> <code className="rounded bg-[#fdeeea] px-1 font-mono">/inventory</code> → <code className="rounded bg-[#fdeeea] px-1 font-mono">/cars</code>, <code className="rounded bg-[#fdeeea] px-1 font-mono">/brands</code> → <code className="rounded bg-[#fdeeea] px-1 font-mono">/cars/brands</code> (all 301).</p>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">4 · Data model — migration 00010</h2>
        <pre className="rounded-xl bg-[#10161d] text-[#d7e2ec] p-5 text-[12.5px] leading-relaxed font-mono overflow-x-auto">
{`-- 1. Vehicles: car | motorbike
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'car';
ALTER TABLE vehicles ADD CONSTRAINT vehicles_vehicle_type_check
  CHECK (vehicle_type IN ('car', 'motorbike'));
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type ON vehicles(vehicle_type);

-- 2. Brands: type-scoped (Honda can exist as both car and bike brand)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'car';
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_name_key;
ALTER TABLE brands ADD CONSTRAINT brands_name_type_key UNIQUE (name, vehicle_type);
ALTER TABLE brands ADD CONSTRAINT brands_category_check
  CHECK (category IN ('chinese', 'foreign', 'trucks', 'bikes'));

-- 3. Quotes: remember which line the enquiry came from
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS vehicle_type TEXT NOT NULL DEFAULT 'car';
CREATE INDEX IF NOT EXISTS idx_quotes_vehicle_type ON quotes(vehicle_type);`}
        </pre>
        <p className="mt-3 text-sm text-[#5b6672]"><b>Zero-downtime:</b> every existing row keeps its <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">DEFAULT &apos;car&apos;</code> untouched.</p>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">5 · Component reuse (no duplicated UI)</h2>
        <p className="mb-3 text-sm">Generalize, do not duplicate. Each component gains <b>one prop</b> (<code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">vehicleType</code>, and where it links, <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">basePath</code>).</p>
        <div className="overflow-hidden rounded-xl border border-[#e5e9ee]">
          <table className="w-full text-[13px]">
            <thead className="bg-[#fbfcfd]">
              <tr className="text-[10px] uppercase tracking-wider text-[#5b6672]">
                <th className="text-left px-3 py-2 font-semibold">Component</th>
                <th className="text-left px-3 py-2 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["InventoryClient", "add vehicleType + basePath; brand list filtered; links use basePath"],
                ["VehicleDetailClient", "add vehicleType prop (Back to Cars/Bikes, WhatsApp text, spec headings)"],
                ["BrandsClient", "add vehicleType + basePath; category tabs adapt per type"],
                ["FeaturedVehicles", "add title + vehicleType props"],
                ["Brands (section)", "add title + vehicleType props"],
                ["VehicleCard", "unchanged — already generic"],
              ].map(([c, ch]) => (
                <tr key={c} className="border-t border-[#e5e9ee]">
                  <td className="px-3 py-2 font-mono text-[12px]">{c}</td>
                  <td className="px-3 py-2 text-[#333c46]">{ch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">6 · Quotes, main admin panel, emails &amp; tracking</h2>
        <ul className="space-y-3 pl-5 list-disc marker:text-[#e8442a]">
          <li><b>Main admin panel (admin.the86connect.com):</b> persist <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">quotes.vehicle_type</code>, send it in the webhook payload, build <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">vehicleLink</code> from the vehicle&apos;s type (<code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">/cars/&lt;slug&gt;</code> vs <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">/bikes/&lt;slug&gt;</code>), use <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">submissionType: &quot;motorbike-quote&quot;</code> for bikes plus a <code className="rounded bg-[#fdeeea] px-1 font-mono text-[12px]">vehicleType</code> field.</li>
          <li><b>Email system (Resend, src/lib/email.ts):</b> confirmation and admin-notification emails link to the right catalogue and say &quot;motorbike&quot; when the quote is for a bike.</li>
          <li><b>Order tracking: unchanged.</b> Same quotes table, same PATCH webhook, same account-page tracking. Bike orders tracked exactly like car orders once vehicle_type is stored.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">7 · Admin changes</h2>
        <div className="overflow-hidden rounded-xl border border-[#e5e9ee]">
          <table className="w-full text-[13px]">
            <tbody>
              {[
                ["/admin/vehicles", "Car management — fixed vehicleType='car'"],
                ["/admin/bikes (new)", "Bike management — fixed motorbike, own sidebar entry"],
                ["/admin/brands", "Cars / Bikes tab; category options per type"],
                ["/admin/quotes", "Car/Bike badge per quote + type filter"],
                ["Dashboard", "Bikes stat card + bikes in distribution"],
                ["VehicleForm.tsx", "Vehicle Type field + bike spec fields"],
              ].map(([p, c]) => (
                <tr key={p} className="border-t border-[#e5e9ee]">
                  <td className="px-3 py-2 font-mono text-[12px] w-44">{p}</td>
                  <td className="px-3 py-2 text-[#333c46]">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">8 · Build order</h2>
        <ol className="space-y-2 pl-5 list-decimal marker:text-[#e8442a] marker:font-bold">
          <li>Migration + types + query layer (append-only, nothing breaks).</li>
          <li>Generalize components with defaults so existing /inventory still works.</li>
          <li>Add /cars and /bikes routes (thin pages over the generalized components).</li>
          <li>Admin — /admin/bikes, form field, brand tabs, quotes badge, dashboard card.</li>
          <li>Homepage — retitle existing sections; add the two bike sections.</li>
          <li>Nav / footer / hero / sitemap + email.ts + api/quotes/route.ts.</li>
          <li>Add redirects /inventory → /cars, /brands → /cars/brands.</li>
          <li>QA + deploy.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">9 · Verification checklist</h2>
        <ul className="space-y-1.5 pl-5 text-sm">
          {[
            "npx tsc --noEmit and npm run lint clean.",
            "npm run build passes.",
            "Add a bike in /admin/bikes → appears on /bikes + homepage Featured Bikes, never on /cars.",
            "Brand filter on /bikes shows only bike brands; clicking a brand filters correctly.",
            "Bike detail page: WhatsApp opens with bike text; Request Quote pre-fills Contact.",
            "Old URLs /inventory, /inventory/<slug>, /brands 301-redirect correctly.",
            "Bike quote arrives in main admin panel labelled correctly; emails link to /bikes.",
          ].map((t) => (
            <li key={t} className="list-none pl-0 flex gap-2">
              <span className="text-[#127a4d] font-bold">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bottom nav */}
      <div className="pt-4 flex flex-wrap gap-3 border-t border-[#e5e9ee]">
        <button
          onClick={onSwitchOffer}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e8442a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c53922] transition-colors"
        >
          💼 Back to the offer →
        </button>
      </div>
    </div>
  );
}
