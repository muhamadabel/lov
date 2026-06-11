import { Caveat } from "next/font/google";

// Caveat (tulisan tangan) hanya dimuat di subtree /space.
const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function SpaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${caveat.variable} min-h-dvh`}
      style={{ overscrollBehavior: "none", backgroundColor: "#0E0100" }}
    >
      {children}
    </div>
  );
}
