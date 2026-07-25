import Link from "next/link";

type LegalType = "privacy" | "terms";

const content: Record<LegalType, { title: string; updated: string; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "1. Introduction",
        body: [
          "86Connect Cars (\u201cwe\u201d, \u201cus\u201d, or \u201cour\u201d) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our vehicle sourcing and export services.",
          "By using our website and services, you consent to the practices described in this policy.",
        ],
      },
      {
        heading: "2. Information We Collect",
        body: [
          "We collect information you provide directly to us, including:",
          "\u2022 Name, email address, phone number, and country when you submit a quote request, contact form, or register an account.",
          "\u2022 Vehicle preferences, budget, and shipping destination details you share during the inquiry process.",
          "\u2022 Communications records when you interact with us via WhatsApp, email, or our chat widget.",
          "We also automatically collect certain technical data, including your IP address, browser type, device information, and pages visited, through cookies and analytics tools.",
        ],
      },
      {
        heading: "3. How We Use Your Information",
        body: [
          "We use your personal information to:",
          "\u2022 Process and respond to your vehicle inquiries and quote requests.",
          "\u2022 Facilitate vehicle sourcing, inspection, purchase, and export arrangements.",
          "\u2022 Coordinate shipping, customs documentation, and delivery to your destination port.",
          "\u2022 Communicate with you about your order status, shipping updates, and payment confirmations.",
          "\u2022 Improve our website, services, and customer experience.",
          "\u2022 Send important notifications about your transactions and any changes to our services.",
        ],
      },
      {
        heading: "4. Information Sharing",
        body: [
          "We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:",
          "\u2022 With verified Chinese vehicle suppliers and manufacturers to source your requested vehicle.",
          "\u2022 With shipping companies, freight forwarders, and customs agents to arrange and complete your shipment.",
          "\u2022 With banks or financial institutions to process your bank transfer (T/T) payments.",
          "\u2022 When required by law, court order, or government authority.",
          "\u2022 In connection with a merger, acquisition, or sale of our business assets.",
        ],
      },
      {
        heading: "5. Data Security",
        body: [
          "We implement appropriate technical and organizational measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. These measures include encrypted data transmission, secure servers, and restricted access controls.",
          "However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
        ],
      },
      {
        heading: "6. Cookies",
        body: [
          "Our website uses cookies and similar technologies to enhance your browsing experience, analyze website traffic, and remember your preferences. You can control cookies through your browser settings, but disabling them may affect website functionality.",
        ],
      },
      {
        heading: "7. Your Rights",
        body: [
          "Depending on your jurisdiction, you may have the right to:",
          "\u2022 Access the personal data we hold about you.",
          "\u2022 Request correction of inaccurate or incomplete data.",
          "\u2022 Request deletion of your personal data.",
          "\u2022 Object to or restrict our processing of your data.",
          "\u2022 Withdraw consent at any time.",
          "To exercise any of these rights, please contact us at the details provided below.",
        ],
      },
      {
        heading: "8. Data Retention",
        body: [
          "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, including for legal, accounting, and reporting requirements. Transaction records are typically retained for a minimum of 5 years.",
        ],
      },
      {
        heading: "9. International Transfers",
        body: [
          "Since our services involve international vehicle export, your personal data may be transferred to and processed in countries other than your country of residence, including China and destination countries. We take steps to ensure your data is protected in accordance with this policy during such transfers.",
        ],
      },
      {
        heading: "10. Children's Privacy",
        body: [
          "Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can delete it.",
        ],
      },
      {
        heading: "11. Changes to This Policy",
        body: [
          "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the updated policy on this page with a revised date. We encourage you to review this page periodically.",
        ],
      },
      {
        heading: "12. Contact Us",
        body: [
          "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:",
          "\u2022 Email: info@the86connect.com",
          "\u2022 WhatsApp: +86 176 1153 3296",
          "\u2022 Website: cars.the86connect.com",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "Last updated: January 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: [
          "Welcome to 86Connect Cars. By accessing or using our website and services, you agree to be bound by these Terms of Service (\u201cTerms\u201d). If you do not agree with any part of these Terms, please do not use our services.",
          "These Terms constitute a legally binding agreement between you (\u201cyou\u201d or \u201cCustomer\u201d) and 86Connect Cars (\u201cwe\u201d, \u201cus\u201d, or \u201cour\u201d).",
        ],
      },
      {
        heading: "2. Our Services",
        body: [
          "86Connect Cars is a vehicle sourcing and export company based in China. Our services include:",
          "\u2022 Sourcing vehicles from verified Chinese manufacturers and suppliers.",
          "\u2022 Negotiating vehicle prices on behalf of customers.",
          "\u2022 Arranging vehicle inspection and quality verification.",
          "\u2022 Handling export documentation and customs clearance.",
          "\u2022 Coordinating worldwide shipping (sea freight RoRo and container shipping) to your destination port.",
          "\u2022 Providing real-time shipment tracking.",
          "We act as a sourcing and export facilitator. We are not the vehicle manufacturer or the shipping carrier.",
        ],
      },
      {
        heading: "3. Vehicle Orders and Quotes",
        body: [
          "All vehicle quotes are provided based on information available at the time of inquiry and are subject to change due to manufacturer pricing, exchange rates, and shipping costs.",
          "A quote is valid for 7 days unless otherwise stated. To proceed with an order, you must confirm the vehicle specifications and provide accurate shipping destination details.",
          "Vehicle specifications, features, and availability are subject to the manufacturer's current production. We will inform you of any material changes before processing your order.",
        ],
      },
      {
        heading: "4. Payment Terms",
        body: [
          "We accept bank transfers (T/T) as our payment method. The standard payment schedule is:",
          "\u2022 30% deposit to secure your vehicle and begin the sourcing process.",
          "\u2022 70% balance due before shipping, once the vehicle is inspected and ready for export.",
          "All payments must be made in full before shipment is dispatched. Payment instructions will be provided in your proforma invoice. We do not accept PayPal, credit cards, or letters of credit.",
          "Prices quoted are in USD unless otherwise specified. Bank transfer fees are the responsibility of the customer.",
        ],
      },
      {
        heading: "5. Shipping and Delivery",
        body: [
          "Shipping times are estimates and vary by destination:",
          "\u2022 Sea Shipping (RoRo): 40\u201360 days",
          "\u2022 Container Shipping: 45\u201365 days",
          "These timelines are approximate and depend on factors including vessel schedules, weather, customs processing, port congestion, and force majeure events. We are not liable for delays caused by shipping carriers, customs authorities, or events beyond our control.",
          "Delivery is made to the destination port (CIF/FOB terms as agreed). The customer is responsible for import duties, taxes, port handling fees, and local customs clearance in the destination country unless explicitly agreed otherwise.",
        ],
      },
      {
        heading: "6. Vehicle Inspection and Condition",
        body: [
          "All vehicles undergo a pre-shipment inspection to verify condition, specifications, and documentation. We provide inspection reports and photos to the customer before shipping.",
          "Once a vehicle is shipped, the customer accepts the vehicle in the condition documented in the inspection report. Any claims regarding vehicle condition must be reported within 7 days of receiving the vehicle at the destination port, supported by photographic evidence.",
        ],
      },
      {
        heading: "7. Cancellation and Refunds",
        body: [
          "Order cancellations are handled as follows:",
          "\u2022 Before vehicle purchase: The deposit is refundable minus a 5% administrative fee.",
          "\u2022 After vehicle purchase but before shipping: The deposit is non-refundable, as the vehicle has been procured on your behalf.",
          "\u2022 After shipping: No cancellations or refunds are possible.",
          "Refunds, where applicable, will be issued via bank transfer to the original payment account within 14 business days.",
        ],
      },
      {
        heading: "8. Customer Responsibilities",
        body: [
          "You agree to:",
          "\u2022 Provide accurate and complete information when requesting quotes or placing orders.",
          "\u2022 Make timely payments according to the agreed schedule.",
          "\u2022 Comply with all import regulations, taxes, and customs requirements in your destination country.",
          "\u2022 Ensure you have the legal right to import the vehicle into your country.",
          "\u2022 Provide correct shipping details, including consignee information and destination port.",
        ],
      },
      {
        heading: "9. Warranties and Disclaimers",
        body: [
          "We warrant that our sourcing and export services will be performed with reasonable care and skill. However, we make no warranties regarding:",
          "\u2022 Vehicle manufacturer warranties, which are provided by the manufacturer and subject to their terms.",
          "\u2022 Shipping timelines, which are estimates and not guaranteed.",
          "\u2022 Compatibility of vehicles with your country's regulations, emission standards, or road requirements.",
          "Our services are provided \u201cas is\u201d and \u201cas available\u201d without warranties of any kind, express or implied, except as explicitly stated in these Terms.",
        ],
      },
      {
        heading: "10. Limitation of Liability",
        body: [
          "To the maximum extent permitted by law, 86Connect Cars shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of our services.",
          "Our total liability for any claim arising from our services shall not exceed the total amount you have paid us for the specific order giving rise to the claim.",
          "We are not liable for delays, losses, or damages caused by third parties including vehicle manufacturers, shipping carriers, customs authorities, or port operators.",
        ],
      },
      {
        heading: "11. Force Majeure",
        body: [
          "We shall not be held liable for any failure or delay in performance caused by events beyond our reasonable control, including but not limited to natural disasters, war, terrorism, government actions, port closures, trade embargoes, pandemics, or significant disruptions to international shipping.",
        ],
      },
      {
        heading: "12. Intellectual Property",
        body: [
          "All content on this website, including text, graphics, logos, vehicle images, and design elements, is the property of 86Connect Cars or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.",
        ],
      },
      {
        heading: "13. Governing Law",
        body: [
          "These Terms shall be governed by and construed in accordance with the laws of the People's Republic of China. Any disputes arising from these Terms or our services shall be resolved through good-faith negotiation, and if unresolved, submitted to the relevant arbitration or court in China.",
        ],
      },
      {
        heading: "14. Changes to Terms",
        body: [
          "We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised date. Your continued use of our services after changes are posted constitutes acceptance of the updated Terms.",
        ],
      },
      {
        heading: "15. Contact Us",
        body: [
          "If you have any questions about these Terms of Service, please contact us:",
          "\u2022 Email: info@the86connect.com",
          "\u2022 WhatsApp: +86 176 1153 3296",
          "\u2022 Website: cars.the86connect.com",
        ],
      },
    ],
  },
};

export function PrivacyTermsContent({ type }: { type: LegalType }) {
  const data = content[type];

  return (
    <main className="min-h-screen bg-[var(--bg-secondary)] pt-24 pb-20 lg:pt-32 lg:pb-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center sm:mb-14">
            <span className="inline-block rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-500">
              Legal
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              {data.title}
            </h1>
            <p className="mt-3 text-sm text-[var(--text-muted)]">{data.updated}</p>
          </div>

          {/* Content */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 lg:p-10">
            <div className="space-y-8">
              {data.sections.map((section, idx) => (
                <section key={idx}>
                  <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-primary)] sm:text-xl">
                    {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {section.body.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Questions about our {type === "privacy" ? "privacy practices" : "terms"}?{" "}
              <Link
                href="/#contact"
                className="font-medium text-brand-500 transition-colors hover:text-brand-600"
              >
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </main>
  );
}
