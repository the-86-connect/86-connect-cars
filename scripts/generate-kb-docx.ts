import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
} from "docx";
import { writeFileSync } from "fs";

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 },
      },
    },
  },
  numbering: {
    config: [
      {
        reference: "faq-numbering",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "86Connect Cars",
              bold: true,
              size: 48,
              color: "1a1a2e",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 400 },
          children: [
            new TextRun({
              text: "Knowledge Base — Company Information & FAQ",
              italics: true,
              size: 26,
              color: "555555",
            }),
          ],
        }),

        new Paragraph({
          text: "About 86Connect",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "86Connect is the digital gateway of Beijing BridgePath International Consulting Co., Ltd, a consulting firm incorporated in Beijing, China on November 23, 2023. The term \"86Connect\" refers to China's international dialing code (+86), symbolizing our role as the direct line connecting the world to China's automotive, educational, and economic opportunities.",
            ),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "We provide a seamless online gateway for individuals and businesses seeking to expand, source, or study in China. With a strategic presence in West Africa, we connect overseas clients with trusted Chinese suppliers and universities — ensuring smooth end-to-end operations from sourcing to delivery, and from application to enrollment.",
            ),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Parent company: ", bold: true }),
            new TextRun("Beijing BridgePath International Consulting Co., Ltd"),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Incorporated: ", bold: true }),
            new TextRun("November 23, 2023 (Beijing, China)"),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Global presence: ", bold: true }),
            new TextRun("Strategic presence in West Africa, serving clients worldwide."),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Track record: ", bold: true }),
            new TextRun(
              "2,000+ cars exported to 40+ countries. Trusted by import dealers, fleet managers, and private buyers across Africa, the Middle East, Southeast Asia, Europe, and Australia.",
            ),
          ],
        }),

        new Paragraph({
          text: "What We Do — Vehicle Export",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "86Connect is your trusted China car export partner. We source premium new and used vehicles directly from China — including leading brands like BYD, Geely, Toyota, Changan, Honda, and more. We handle everything from sourcing and inspection to shipping and documentation.",
            ),
          ],
        }),

        new Paragraph({
          text: "Brands We Offer",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "We work with verified suppliers across China, offering both Chinese and international brands:",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Chinese EV brands: ", bold: true }),
            new TextRun("BYD (electric vehicles, Blade Battery technology)"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Chinese ICE brands: ", bold: true }),
            new TextRun("Geely (Volvo-derived engineering, CMA platform), Changan"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "International brands (China-sourced): ", bold: true }),
            new TextRun("Toyota, Honda, and more — manufactured in China for export"),
          ],
        }),

        new Paragraph({
          text: "Featured Vehicles",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300 },
        }),

        new Paragraph({
          text: "BYD Seal — Premium Electric Sedan",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Price: ", bold: true }),
            new TextRun("From $28,800 USD"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "The BYD Seal is a premium electric sedan built on BYD's e-Platform 3.0 with Blade Battery technology. CLTC range of 570 km, dual-motor AWD with 523 hp, 0-100 km/h in 3.8 seconds. Features a 15.6-inch rotating touchscreen, leather seats, ADAS Level 2, panoramic sunroof, Dynaudio sound system, and OTA updates.",
            ),
          ],
        }),

        new Paragraph({
          text: "Toyota RAV4 Hybrid — Best-Selling Hybrid SUV",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Price: ", bold: true }),
            new TextRun("From $22,500 USD"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "The world's best-selling hybrid SUV with legendary Toyota reliability. 2.5L hybrid powertrain, 219 hp, AWD-i intelligent all-wheel drive, 5.8 L/100 km fuel economy. Includes Toyota Safety Sense 2.0, Apple CarPlay & Android Auto, power tailgate, JBL premium audio, and panoramic view monitor.",
            ),
          ],
        }),

        new Paragraph({
          text: "Geely Monjaro — Premium Mid-Size SUV",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Price: ", bold: true }),
            new TextRun("From $18,900 USD"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "A premium mid-size SUV built on the CMA platform shared with Volvo. 2.0T turbo engine with 238 hp, AWD, 0-100 km/h in 7.7 seconds. Features Nappa leather seats, 12.3-inch vertical touchscreen, Bose 12-speaker audio, Level 2 autonomous driving, 360-degree camera, heads-up display, and air purification system.",
            ),
          ],
        }),

        new Paragraph({
          text: "Honda Civic — Trusted Compact Sedan",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Price: ", bold: true }),
            new TextRun("From $17,200 USD"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "One of the most trusted sedans worldwide. 1.5L VTEC Turbo with 180 hp, 6.0 L/100 km fuel economy. Includes Honda Sensing safety suite, 9-inch touchscreen, Apple CarPlay & Android Auto, honeycomb dashboard design, sport mode with paddle shifters, and wireless phone charging. Known for reliability, low maintenance costs, and strong resale value.",
            ),
          ],
        }),

        new Paragraph({
          text: "BYD Han EV — Flagship Electric Sedan",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "BYD's flagship electric sedan with Blade Battery, long range, and luxury interior. A popular choice for private buyers and executive fleets.",
            ),
          ],
        }),

        new Paragraph({
          text: "Our Services",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),

        new Paragraph({
          text: "1. Vehicle Sourcing",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "Direct access to China's most trusted dealerships and manufacturers. Every supplier is vetted for quality and reliability. Tell us the car you want — brand, model, year, and budget — and we leverage our verified supplier network to find the best matching vehicle.",
            ),
          ],
        }),

        new Paragraph({
          text: "2. 150-Point Inspection",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "Certified technicians inspect every vehicle before shipment. You see detailed photos and videos before you commit. Every vehicle undergoes a comprehensive 150-point inspection by our certified technicians before shipment. You receive a detailed inspection report with photos and videos, ensuring complete transparency.",
            ),
          ],
        }),

        new Paragraph({
          text: "3. End-to-End Logistics",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "From factory to your port — we manage shipping, tracking, and all export documentation with complete transparency. We arrange shipping via RoRo or container, with real-time tracking to your port. We handle all China-side export customs clearance.",
            ),
          ],
        }),

        new Paragraph({
          text: "4. Transparent Pricing",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "No hidden fees. No surprises. Itemized quotations with vehicle cost, inspection, and shipping clearly separated. You get a transparent, itemized quotation within 24 hours — including vehicle cost, inspection, and shipping to your destination.",
            ),
          ],
        }),

        new Paragraph({
          text: "5. 24/7 Support",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "English and Chinese support teams available around the clock. Get answers when you need them, wherever you are.",
            ),
          ],
        }),

        new Paragraph({
          text: "How It Works — The 6-Step Process",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Step 1: Tell Us the Car. ", bold: true }),
            new TextRun(
              "Share your desired brand, model, year, and budget. The more details you provide, the better we can match your needs.",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Step 2: We Source the Best. ", bold: true }),
            new TextRun(
              "Our team searches our verified supplier network across China to find the perfect vehicle that matches your specifications.",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Step 3: Receive Quotation. ", bold: true }),
            new TextRun(
              "Get a transparent, itemized quotation within 24 hours — including vehicle cost, inspection, and shipping to your destination.",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Step 4: Inspection. ", bold: true }),
            new TextRun(
              "Every vehicle undergoes a rigorous 150-point inspection. You receive a detailed report with photos and videos before approval.",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Step 5: Shipping. ", bold: true }),
            new TextRun(
              "We handle all export documentation and arrange shipping via RoRo or container, with real-time tracking to your port.",
            ),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Step 6: Delivered. ", bold: true }),
            new TextRun(
              "Your vehicle arrives at the destination port with all documents ready for customs clearance. Drive away with confidence.",
            ),
          ],
        }),

        new Paragraph({
          text: "Shipping Times by Region",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Southeast Asia: ", bold: true }),
            new TextRun("7-14 days"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Middle East: ", bold: true }),
            new TextRun("18-30 days"),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Africa: ", bold: true }),
            new TextRun("25-40 days"),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Europe & Australia: ", bold: true }),
            new TextRun("30-45 days"),
          ],
        }),

        new Paragraph({
          text: "Payment Methods",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "We accept bank transfers (T/T), letters of credit (L/C), and PayPal for deposits. A 30% deposit secures your vehicle, with the balance due before shipping. All transactions are transparent and documented.",
            ),
          ],
        }),

        new Paragraph({
          text: "Warranty",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "New vehicles carry the manufacturer's warranty where applicable. For used vehicles, we offer optional extended warranty coverage. Our 150-point inspection ensures every vehicle meets quality standards before export.",
            ),
          ],
        }),

        new Paragraph({
          text: "Export Documents Included",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun(
              "We handle all export documentation including the commercial invoice, packing list, bill of lading, certificate of origin, and export customs clearance. You receive a complete document package for smooth import at your destination.",
            ),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun(
              "While we handle all China-side export customs, we work with trusted partners in most destination countries who can assist with import clearance. We'll connect you with reliable local agents to complete the process smoothly.",
            ),
          ],
        }),

        new Paragraph({
          text: "Frequently Asked Questions",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),

        new Paragraph({
          text: "Q: How does the vehicle sourcing process work?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "Simply tell us the car you want — brand, model, year, and budget. We leverage our verified supplier network across China to find the best matching vehicle, negotiate the price, and provide you with a detailed quotation within 24 hours.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: What payment methods do you accept?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "We accept bank transfers (T/T), letters of credit (L/C), and PayPal for deposits. A 30% deposit secures your vehicle, with the balance due before shipping. All transactions are transparent and documented.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: How long does shipping take?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "Shipping times vary by destination: 7-14 days to Southeast Asia, 18-30 days to the Middle East, 25-40 days to Africa, and 30-45 days to Europe and Australia. We provide real-time tracking throughout the journey.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: Do you inspect vehicles before shipping?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "Absolutely. Every vehicle undergoes a comprehensive 150-point inspection by our certified technicians before shipment. You receive a detailed inspection report with photos and videos, ensuring complete transparency.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: What documents are included with the export?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "We handle all export documentation including the commercial invoice, packing list, bill of lading, certificate of origin, and export customs clearance. You receive a complete document package for smooth import at your destination.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: Is there a warranty on exported vehicles?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "New vehicles carry the manufacturer's warranty where applicable. For used vehicles, we offer optional extended warranty coverage. Our 150-point inspection ensures every vehicle meets quality standards before export.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: Can you handle customs clearance at my destination?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "While we handle all China-side export customs, we work with trusted partners in most destination countries who can assist with import clearance. We'll connect you with reliable local agents to complete the process smoothly.",
            ),
          ],
        }),

        new Paragraph({
          text: "Q: What if the vehicle doesn't match the description?",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200 },
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "Our inspection reports with photos and videos ensure what you see is what you get. In the rare event of a discrepancy, we have a clear resolution process. Your deposit is fully refundable if the vehicle fails inspection.",
            ),
          ],
        }),

        new Paragraph({
          text: "Customer Testimonials",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Ahmed Khan — Import Dealer, Pakistan 🇵🇰", bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "\"86Connect sourced 12 vehicles for my dealership in Karachi. Every car arrived exactly as inspected. The transparent pricing and professional documentation saved me weeks of hassle.\"",
            ),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "David Okonkwo — Fleet Manager, Nigeria 🇳🇬", bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "\"I've imported over 30 cars through 86Connect. Their inspection process is rigorous and shipping to Lagos has always been on time. This is the most reliable export partner I've worked with.\"",
            ),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Rashid Al-Maktoum — Private Buyer, UAE 🇦🇪", bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "\"From quotation to delivery in Dubai, the entire process took 18 days. The BYD Han EV I ordered was in pristine condition. 86Connect handles everything professionally.\"",
            ),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "James Mwangi — Business Owner, Kenya 🇰🇪", bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "\"The team at 86Connect understood exactly what I needed. They found the perfect Toyota RAV4 within my budget and handled all the export paperwork. Shipping to Mombasa was seamless.\"",
            ),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Tanaka Hiroshi — Auto Reseller, Japan 🇯🇵", bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "\"Even as a Japanese buyer, sourcing Chinese EVs through 86Connect was effortless. Their English and Chinese support team is responsive 24/7. Highly recommended for serious buyers.\"",
            ),
          ],
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "Sarah Williams — Dealer Principal, Australia 🇦🇺", bold: true }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              "\"We've built a strong partnership with 86Connect over two years. Their supplier network in China is unmatched, and the quality of vehicles consistently exceeds expectations.\"",
            ),
          ],
        }),

        new Paragraph({
          text: "Contact Information",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400 },
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Website: ", bold: true }),
            new TextRun("https://cars.the86connect.com"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "WhatsApp: ", bold: true }),
            new TextRun("+86 176 1153 3296"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Email: ", bold: true }),
            new TextRun("info@the86connect.com"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Company: ", bold: true }),
            new TextRun("Beijing BridgePath International Consulting Co., Ltd"),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "Location: ", bold: true }),
            new TextRun("Beijing, China (headquarters) | West Africa (regional office)"),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Response time: ", bold: true }),
            new TextRun("Quotation within 24 hours. 24/7 support in English and Chinese."),
          ],
        }),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600 },
          children: [
            new TextRun({
              text: "— End of Knowledge Base —",
              italics: true,
              color: "999999",
              size: 20,
            }),
          ],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = process.argv[2] || "86Connect-Knowledge-Base.docx";
  writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
});
