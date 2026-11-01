import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const font = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-main" });

export const metadata = {
  title: "Earth Events Tracker",
  description: "Live map of wildfires, storms, volcanoes and other natural events, powered by NASA EONET.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${font.variable} font-sans`}>{children}</body>
    </html>
  );
}
