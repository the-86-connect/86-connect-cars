"use client";

export function OfferSection({ onSwitchPlan }: { onSwitchPlan: () => void }) {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-[#0f1419]">
      {/* Nav buttons — always visible at top */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <button
          onClick={onSwitchPlan}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e8442a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c53922] transition-colors"
        >
          📐 Read the technical plan →
        </button>
      </div>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">1 · The offer</h2>
        <p className="text-lg leading-snug">
          Add full <strong className="text-[#e8442a]">motorbike selling &amp; export</strong> to your existing website — plus bonus features — delivered in <strong className="text-[#e8442a]">7 days</strong>.
        </p>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">2 · What you get</h2>
        <p className="mb-4 text-[#5b6672]">
          Your website already stores everything a motorbike needs (price, engine size, photos, and specifications). So motorbikes are added as a second product type on the <b>same system</b> — no separate website, no double work, no extra hosting.
        </p>
        <ul className="space-y-2 pl-5 list-disc marker:text-[#e8442a]">
          <li>Motorbike product type added to your catalogue.</li>
          <li>Separate <b>Bikes</b> section — its own inventory page, alongside the existing Cars pages.</li>
          <li>Motorbike detail pages: photos, specs, and full details.</li>
          <li>Full <b>export details</b> on every bike — FOB price, port of loading, shipping estimate, and export documents.</li>
          <li><b>Bike brands</b> section and brand page, kept separate from Car brands.</li>
          <li>Admin panel: <b>add, edit, and delete motorbikes</b>, exactly like cars.</li>
          <li><b>Bike enquiries reach you the same way car quotes do</b> — every motorbike quote arrives in your main admin panel (admin.the86connect.com), sends the email notifications, and gets order tracking, automatically.</li>
          <li>Search-engine setup so motorbikes show up on Google.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">3 · Bonus features included</h2>
        <p className="mb-4">Bundled at no extra cost:</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { t: "Homepage motorbike showcase", d: "Your new product line is visible the moment customers land." },
            { t: "WhatsApp on each product", d: "Buyers reach you in one tap — more leads, less friction." },
            { t: "Engine-size & brand filters", d: "Buyers find the right bike fast, so more conversions." },
            { t: "Export spec sheet (PDF)", d: "One click turns any bike into a clean PDF datasheet you can send to buyers." },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-[#e5e9ee] bg-[#fbfcfd] p-4">
              <h4 className="font-semibold text-sm mb-1">{c.t}</h4>
              <p className="text-sm text-[#5b6672]">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[#5b6672]">
          <b>Not included in this budget:</b> AI chatbot training for bikes, and the bike comparison + EMI calculator. These can be quoted separately as new work.
        </p>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">4 · Work plan (7 days)</h2>
        <div className="overflow-hidden rounded-xl border border-[#e5e9ee]">
          <table className="w-full text-sm">
            <thead className="bg-[#fbfcfd]">
              <tr className="text-[11px] uppercase tracking-wider text-[#5b6672]">
                <th className="text-left px-4 py-3 font-semibold">Day</th>
                <th className="text-left px-4 py-3 font-semibold">Work</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "Database update — motorbikes become a product type (your existing cars untouched)."],
                ["2–3", "Separate Cars and Bikes inventory pages + motorbike detail pages."],
                ["4", "Admin — add / edit / delete motorbikes; bike quotes wired into your main admin panel, emails, and tracking."],
                ["5", "Homepage showcase, WhatsApp on each product, PDF spec sheet, filters, SEO."],
                ["6", "Testing — add real bikes, check every page on phone and desktop."],
                ["7", "Go live on production and hand over."],
              ].map(([d, w]) => (
                <tr key={d} className="border-t border-[#e5e9ee]">
                  <td className="px-4 py-3 font-semibold text-[#0f1419] w-24">{d}</td>
                  <td className="px-4 py-3 text-[#333c46]">{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">5 · Value breakdown</h2>
        <div className="overflow-hidden rounded-xl border border-[#e5e9ee]">
          <table className="w-full text-sm">
            <thead className="bg-[#fbfcfd]">
              <tr className="text-[11px] uppercase tracking-wider text-[#5b6672]">
                <th className="text-left px-4 py-3 font-semibold">Item</th>
                <th className="text-right px-4 py-3 font-semibold">Normal value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Motorbike catalogue + detail pages", "$120"],
                ["Admin add / edit / delete for bikes", "$100"],
                ["Homepage showcase + WhatsApp on each product", "$70"],
                ["SEO + engine-size & brand filters", "$60"],
                ["Export spec sheet (PDF)", "$50"],
              ].map(([i, v]) => (
                <tr key={i} className="border-t border-[#e5e9ee]">
                  <td className="px-4 py-3">{i}</td>
                  <td className="px-4 py-3 text-right text-[#0f1419]">{v}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#0f1419] font-bold">
                <td className="px-4 py-3">Total value</td>
                <td className="px-4 py-3 text-right text-[#5b6672] line-through">$400</td>
              </tr>
              <tr className="bg-[#fdeeea] font-extrabold text-[#e8442a] text-lg">
                <td className="px-4 py-3">Your price today</td>
                <td className="px-4 py-3 text-right">$150</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">6 · Price &amp; scope</h2>
        <p className="mb-4"><b>Total: $150</b>, one-time and fixed — no hidden costs.</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[#bfe6d2] bg-[#f2fbf6] p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#127a4d]">Free · maintenance</span>
            <h4 className="font-semibold mt-1 mb-2">Small changes</h4>
            <p className="text-sm text-[#127a4d]/80">Text edits, photo swaps, colour or spacing tweaks — quick adjustments to something that already exists.</p>
          </div>
          <div className="rounded-xl border border-[#f6cdc4] bg-[#fdeeea] p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#e8442a]">Paid · new work</span>
            <h4 className="font-semibold mt-1 mb-2">New features or system changes</h4>
            <p className="text-sm text-[#e8442a]/80">Any new feature, new page, or change to how the system works is always a separate paid task, because it needs new development and testing from scratch.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] uppercase tracking-[1px] text-[#e8442a] font-bold mb-3">7 · Acceptance</h2>
        <p className="mb-4">Sign below to approve the $150 motorbike expansion.</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="pt-6 border-t border-[#0f1419]">
            <div className="text-xs text-[#5b6672] mb-1">Owner — 86Connect</div>
            <div className="py-3 text-[#0f1419]">_______</div>
            <div className="text-xs text-[#5b6672]">Signature &amp; date</div>
          </div>
          <div className="pt-6 border-t border-[#0f1419]">
            <div className="text-xs text-[#5b6672] mb-1">Developer — Milton</div>
            <div className="py-3 text-[#0f1419]">_______</div>
            <div className="text-xs text-[#5b6672]">Signature &amp; date</div>
          </div>
        </div>
      </section>

      {/* Bottom nav */}
      <div className="pt-4 flex flex-wrap gap-3 border-t border-[#e5e9ee] print:hidden">
        <button
          onClick={onSwitchPlan}
          className="inline-flex items-center gap-2 rounded-lg bg-[#e8442a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#c53922] transition-colors"
        >
          📐 Read the technical plan →
        </button>
      </div>
    </div>
  );
}
