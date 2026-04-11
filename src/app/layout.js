import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Més enllà d'Orió",
  description: "Connectant amb l'univers des del nostre punt blau: blog, vídeos i molt més.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body className={inter.className}>
        <Navbar />
        <main className="layout-container" style={{ flex: 1, padding: '2rem 1rem' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
