import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "SynapticAgent - Neural Multi-Agent AI",
  description: "Framework TypeScript moderne pour la création de systèmes multi-agents hiérarchisés, où les agents collaborent et s'adaptent comme des neurones dans un réseau neuronal.",
  keywords: ["AI", "Multi-Agent", "Neural Network", "TypeScript", "Chat", "Agent"],
  authors: [{ name: "AlzC" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
