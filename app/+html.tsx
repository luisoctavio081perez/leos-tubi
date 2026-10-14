import { ScrollViewStyleReset } from 'expo-router/html'

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Leo's Tubi</title>
        <meta name="description" content="Leo's Tubi - Leo Streaming TV Premium" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  )
}
