import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'
import 'leaflet/dist/leaflet.css';


// O wrapper inteligente controla as rotas públicas e privadas internamente
import ClientLayoutWrapper from './client-layout-wrapper'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GestRes - Gestão de Residências',
  description: 'Sistema administrativo de gestão de residências',
  generator: 'v0.app',
  icons: {
    icon: '/sircah-favicon.svg',
    shortcut: '/sircah-favicon.svg',
    apple: '/sircah-favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem
        >
          {/* Mantemos o wrapper aqui; ele agora sabe quando ocultar a sidebar */}
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}