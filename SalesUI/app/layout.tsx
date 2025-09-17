import type { Metadata } from "next";
import "@livekit/components-styles";
import "./globals.css";

export const metadata: Metadata = {
    title: "Digital Sales Agent",
    description: "AI-powered sales automation using Coral Protocol",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="font-sans antialiased bg-gray-50">
                {children}
            </body>
        </html>
    );
}