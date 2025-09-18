import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
    title: "Digital Sales Agent",
    description: "AI-powered sales automation platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={GeistSans.className}>
            <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
                {children}
            </body>
        </html>
    );
}