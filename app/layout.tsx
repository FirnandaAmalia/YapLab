import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { AppShell } from './_components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'YapLab — Personal English Learning Studio',
  description: 'Personal English learning studio by Nanda. SRS flashcards, YouTube dictation, speaking practice, and progress analytics.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="h-full antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}