import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Astro Forecast",
  description: "Астрологический сервис прогнозов"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
