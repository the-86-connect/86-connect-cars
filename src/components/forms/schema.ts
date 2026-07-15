import { z } from "zod";

export const quoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  whatsapp: z.string().min(5, "WhatsApp number is required"),
  email: z.string().email("Valid email is required"),
  country: z.string().min(2, "Country is required"),
  vehicleBrand: z.string().min(1, "Vehicle brand is required"),
  model: z.string().optional().default(""),
  budget: z.string().min(1, "Budget is required"),
  message: z.string().min(10, "Please tell us what you're looking for"),
  referenceImages: z.array(z.string()).max(3, "Maximum 3 images allowed").optional().default([]),
});

/** Raw form values (before Zod applies defaults/transforms). */
export type QuoteFormInput = z.input<typeof quoteSchema>;

/** Validated form values (after Zod applies defaults/transforms). */
export type QuoteFormValues = z.infer<typeof quoteSchema>;
