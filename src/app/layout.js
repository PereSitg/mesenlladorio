import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Més enllà d'Orió",
  description: "Tecnologia, estafes, històries, criptomonedes i coses random. Parlem de tot allò que ens interessa i passa pel cap.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body className={inter.className}>
        <Navbar />
        <main className="layout-container" style={{ flex: 1, paddingTop: '150px' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
// Sincronitzat amb Firebase Project: mesenlladorio-59995
