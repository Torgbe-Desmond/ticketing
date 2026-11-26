import Link from "next/link";

interface UserPayload {
  id: string;
  email: string;
}

interface Props {
  currentUser: UserPayload | null;
}

interface NavLink {
  label: string;
  href: string;
}

export default function Header({ currentUser }: Props) {
  const links: NavLink[] = currentUser
    ? [
      { label: "Sign Out", href: "/auth/signout" }, 
      {label: "Sell Tickets", href: "/tickets/new" },
      {label: "My Orders", href: "/orders" }
    ]
    : [
        { label: "Sign Up", href: "/auth/signup" },
        { label: "Sign In", href: "/auth/signin" },
      ];

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <Link href="/" className="text-lg font-bold text-gray-900">
        GitTix
      </Link>

      <ul className="flex items-center gap-4">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
