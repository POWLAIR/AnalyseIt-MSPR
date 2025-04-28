import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PageTransition from "./components/layout/PageTransition";
import LoadingBar from "./components/layout/LoadingBar";
import SearchParamsWrapper from "./components/shared/SearchParamsWrapper";
import { Toaster } from "./components/ui/toaster";

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
      <body className="font-sans bg-gradient-blue-purple">
        <LoadingBar />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/grid-pattern.svg')] bg-center opacity-5 -z-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white/20 -z-10 pointer-events-none"></div>
            <SearchParamsWrapper>
              <PageTransition>
                {children}
              </PageTransition>
            </SearchParamsWrapper>
          </main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
