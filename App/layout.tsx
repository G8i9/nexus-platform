export const metadata = {
  title: 'NEXUS',
  description: 'Infrastructure Intelligence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        {children}
      </body>
    </html>
  )
}
