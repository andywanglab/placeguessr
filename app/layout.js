import "./globals.css";

export const metadata = {
  title: "PlaceGuessr - 2 Player Battle",
  description: "A GeoGuessr-style 2-player split screen battle game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
