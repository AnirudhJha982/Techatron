import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import VoiceAssistant from "@/components/VoiceAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mandi Marg | Digital Agricultural Procurement",
  description: "Mandi Marg is a digital platform connecting farmers with mandis for transparent and efficient agricultural procurement.",
  applicationName: "Mandi Marg",
  openGraph: {
    title: "Mandi Marg | Digital Agricultural Procurement",
    description: "Mandi Marg is a digital platform connecting farmers with mandis for transparent and efficient agricultural procurement.",
    siteName: "Mandi Marg"
  }
};

export default async function RootLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;

  const {
    locale
  } = params;

  const {
    children
  } = props;

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          {children}
          <VoiceAssistant />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
