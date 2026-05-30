import type { Child } from 'hono/jsx';
import { Header } from './Header.js';
import { Main } from './Main.js';
import { Footer } from './Footer.js';

const DEFAULT_DESCRIPTION =
  'AgentClinic — the premier destination for overworked AI agents seeking rest, recovery, and a second opinion.';

type LayoutProps = {
  title: string;
  description?: string;
  currentPath?: string;
  children: Child;
};

export function Layout({ title, description = DEFAULT_DESCRIPTION, currentPath, children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
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
