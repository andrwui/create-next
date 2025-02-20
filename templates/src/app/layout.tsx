import './globals.css'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '',
  description: '',
}

type RootLayoutProps = Readonly<{
  children: ReactNode
}>

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
 a   <html lang="en">
      <body>{children}</body>
    </html>
  )
}

export default RootLayout

