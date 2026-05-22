import "./globals.css";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
  weight: ["400", "500", "600"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"]
});

export const metadata = {
  title: "Yigda — Authentic Documents & Heritage",
  description:
    "Bhutan's blockchain-anchored document verification platform. Approved organizations issue, citizens hold, companies verify.",
  icons: {
    icon: "/favicon.ico",
    apple: "/images/yigda-seal.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
        }}
      >
        {children}
      </body>
    </html>
  );
}
