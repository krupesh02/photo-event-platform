import { Camera } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t py-12"
      style={{
        borderColor: "hsl(var(--border))",
        background: "hsl(var(--surface))",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">PhotoAI</span>
            </Link>
            <p className="text-sm max-w-sm" style={{ color: "hsl(var(--text-muted))" }}>
              AI-powered photo sharing for every occasion. Upload, recognize, and deliver photos
              to your guests in seconds.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: "hsl(var(--text))" }}>
              Product
            </h4>
            <div className="flex flex-col gap-2">
              {["Features", "Pricing", "Events", "Gallery"].map((t) => (
                <span key={t} className="text-sm cursor-pointer hover:underline" style={{ color: "hsl(var(--text-muted))" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: "hsl(var(--text))" }}>
              Company
            </h4>
            <div className="flex flex-col gap-2">
              {["About", "Blog", "Contact", "Privacy"].map((t) => (
                <span key={t} className="text-sm cursor-pointer hover:underline" style={{ color: "hsl(var(--text-muted))" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="border-t mt-10 pt-6 text-center text-xs"
          style={{
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--text-muted))",
          }}
        >
          © {new Date().getFullYear()} PhotoAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
