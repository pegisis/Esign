import type { Metadata } from 'next'
import { Geist, Geist_Mono, Dancing_Script, Great_Vibes, Pacifico, Satisfy, Caveat, Homemade_Apple } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const dancingScript = Dancing_Script({ 
  subsets: ["latin"],
  variable: "--font-dancing"
});
const greatVibes = Great_Vibes({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vibes"
});
const pacifico = Pacifico({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico"
});
const satisfy = Satisfy({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-satisfy"
});
const caveat = Caveat({ 
  subsets: ["latin"],
  variable: "--font-caveat"
});
const homemadeApple = Homemade_Apple({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-homemade"
});

export const metadata: Metadata = {
  title: 'SignDoc - Document Signature Made Simple',
  description: 'Upload documents, add your signature, and download signed PDFs in seconds',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${dancingScript.variable} ${greatVibes.variable} ${pacifico.variable} ${satisfy.variable} ${caveat.variable} ${homemadeApple.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
