"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, CheckCircle2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/Button";
import { MultiImageUpload } from "./MultiImageUpload";

import { quoteSchema, type QuoteFormInput, type QuoteFormValues } from "./schema";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const inputClass =
  "w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none backdrop-blur-md transition-all placeholder:text-[var(--text-muted)] focus:border-accent-400 focus:ring-2 focus:ring-accent-100";

const budgetOptions = [
  "$5,000 - $15,000",
  "$15,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000+",
];

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-brand-500">{error}</p>}
    </div>
  );
}

export function QuoteForm({
  defaultBrand,
  defaultModel,
}: {
  defaultBrand?: string;
  defaultModel?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormInput, unknown, QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    mode: "onBlur",
    defaultValues: {
      vehicleBrand: defaultBrand ?? "",
      model: defaultModel ?? "",
      referenceImages: [],
    },
  });

  const referenceImages = watch("referenceImages") ?? [];

  const onSubmit = async (data: QuoteFormValues) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          whatsapp: data.whatsapp,
          email: data.email,
          country: data.country,
          vehicleBrand: data.vehicleBrand,
          model: data.model || "",
          budget: data.budget,
          message: data.message,
          referenceImages: data.referenceImages ?? [],
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setSubmitError("Failed to submit your request. Please try again or contact us on WhatsApp.");
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex flex-col items-center py-10 text-center sm:py-14"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50"
            >
              <CheckCircle2 className="h-10 w-10 text-brand-500" />
            </motion.div>
            <h3 className="mt-6 font-display text-2xl font-bold text-[var(--text-primary)]">
              Request Submitted!
            </h3>
            <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
              Your quote request has been submitted. We'll contact you within 24 hours via WhatsApp or email.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Full Name" error={errors.name?.message} className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="John Doe"
                  className={inputClass}
                  {...register("name")}
                />
              </Field>

              <Field
                label="WhatsApp Number"
                error={errors.whatsapp?.message}
                className="sm:col-span-1"
              >
                <input
                  type="tel"
                  placeholder="+1 234 567 890"
                  className={inputClass}
                  {...register("whatsapp")}
                />
              </Field>

              <Field
                label="Email Address"
                error={errors.email?.message}
                className="sm:col-span-1"
              >
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  {...register("email")}
                />
              </Field>

              <Field
                label="Country"
                error={errors.country?.message}
                className="sm:col-span-1"
              >
                <input
                  type="text"
                  placeholder="United Arab Emirates"
                  className={inputClass}
                  {...register("country")}
                />
              </Field>

              <Field
                label="Vehicle Brand"
                error={errors.vehicleBrand?.message}
                className="sm:col-span-1"
              >
                <input
                  type="text"
                  placeholder="BYD, Toyota, Geely..."
                  className={inputClass}
                  {...register("vehicleBrand")}
                />
              </Field>

              <Field
                label="Model (Optional)"
                error={errors.model?.message}
                className="sm:col-span-1"
              >
                <input
                  type="text"
                  placeholder="Seal, Han EV, RAV4..."
                  className={inputClass}
                  {...register("model")}
                />
              </Field>

              <Field
                label="Budget"
                error={errors.budget?.message}
                className="sm:col-span-2"
              >
                <div className="relative">
                  <select
                    className={cn(inputClass, "cursor-pointer appearance-none pr-10")}
                    defaultValue=""
                    {...register("budget")}
                  >
                    <option value="" disabled>
                      Select your budget range
                    </option>
                    {budgetOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                </div>
              </Field>

              <Field
                label="Message"
                error={errors.message?.message}
                className="sm:col-span-2"
              >
                <textarea
                  rows={4}
                  placeholder="Tell us about the vehicle you're looking for — year, color, specs, any specific requirements..."
                  className={cn(inputClass, "resize-none")}
                  {...register("message")}
                />
              </Field>

              <Field label="Reference Images (Optional, max 3)" className="sm:col-span-2">
                <MultiImageUpload
                  value={referenceImages}
                  onChange={(urls) => setValue("referenceImages", urls)}
                  maxImages={3}
                />
              </Field>
            </div>

            <div className="mt-2 block w-full">
              {submitError && (
                <p className="mb-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-brand-500">
                  {submitError}
                </p>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Submit Request"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
