import type { Child } from 'hono/jsx';

type MainProps = {
  children: Child;
};

export function Main({ children }: MainProps) {
  return <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-16">{children}</main>;
}
