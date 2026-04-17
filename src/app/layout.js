import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

import Newsletter from "@/components/Newsletter";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Més enllà d'Orió",
  description: "Tecnologia, estafes, històries, criptomonedes i coses random. Parlem de tot allò que ens interessa i passa pel cap.",
  icons: {
    icon: '/favicon.ico?v=2',
  },
  openGraph: {
    title: "Més enllà d'Orió",
    description: "Tecnologia, estafes, històries, criptomonedes i coses random.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Més enllà d'Orió",
    description: "Tecnologia, estafes, històries, criptomonedes i coses random.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body className={inter.className}>
        <ScrollToTop />
        <Navbar />
        <main className="layout-container" style={{ flex: 1, paddingTop: '110px' }}>
          {children}
        </main>
        <Newsletter />
        <Footer />
      </body>
    </html>
  );
}
// Sincronitzat amb Firebase Project: mesenlladorio-59995
