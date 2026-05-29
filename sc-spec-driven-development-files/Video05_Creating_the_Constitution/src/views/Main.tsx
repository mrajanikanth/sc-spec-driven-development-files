import type { Child } from 'hono/jsx';

type MainProps = {
  children: Child;
};

export function Main({ children }: MainProps) {
  return (
    <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">{children}</main>
  );
}
