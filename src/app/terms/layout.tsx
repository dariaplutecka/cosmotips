import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "CosmoTips Terms of Service — rules for using the personalised horoscope application, purchases, Stripe payments, and consumer rights.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
