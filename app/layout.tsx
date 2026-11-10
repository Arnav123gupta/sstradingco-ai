import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSTradingCo AI | Flipkart Listing Studio",
  description: "Prepare, review and approve new Flipkart product listings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
