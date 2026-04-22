import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Script from "next/script";

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
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
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
