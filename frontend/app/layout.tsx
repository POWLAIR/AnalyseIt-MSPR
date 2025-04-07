import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import LoadingBar from "./components/LoadingBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AnalyzeIT - Plateforme d'analyse des données pandémiques",
  description: "Visualisez et analysez les données des pandémies à travers le monde",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gradient-blue-purple`}>
        <LoadingBar />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid-pattern.svg')] bg-center opacity-5 -z-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white/20 -z-10 pointer-events-none"></div>
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
