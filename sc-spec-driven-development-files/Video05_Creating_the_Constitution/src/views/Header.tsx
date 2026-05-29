type HeaderProps = {
  currentPath?: string;
};

type NavLink = { href: string; label: string };

const LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/agents', label: 'Agents' },
  { href: '/dashboard', label: 'Dashboard' },
];

function isActive(currentPath: string | undefined, href: string): boolean {
  if (!currentPath) return false;
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(href + '/');
}

export function Header({ currentPath }: HeaderProps) {
  return (
    <header class="container">
      <nav aria-label="Primary">
        <ul>
          <li>
            <a href="/" class="contrast">
              <strong class="wordmark">AgentClinic</strong>
            </a>
          </li>
        </ul>
        <ul>
          {LINKS.map((link) => {
            const active = isActive(currentPath, link.href);
            return (
              <li>
                <a
                  href={link.href}
                  {...(active ? { 'aria-current': 'page' } : {})}
                >
                  {active ? <strong>{link.label}</strong> : link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
