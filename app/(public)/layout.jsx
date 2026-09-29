import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";

/** Public marketing + discovery shell. */
export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
