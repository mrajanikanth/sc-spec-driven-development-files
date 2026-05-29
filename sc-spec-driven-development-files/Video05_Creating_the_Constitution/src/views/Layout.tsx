import type { Child } from 'hono/jsx';
import { Header } from './Header.js';
import { Main } from './Main.js';
import { Footer } from './Footer.js';

type LayoutProps = {
  title: string;
  currentPath?: string;
  children: Child;
};

export function Layout({ title, currentPath, children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/pico.min.css" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header currentPath={currentPath} />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  );
}
