import Link from "next/link";

const navigation = {
  main: [
    { name: "Terms", href: "/terms" },
    { name: "Source code", href: "https://github.com/techulus/manage" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-28 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-5xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav
          className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <Link
                href={item.href}
                className="text-sm leading-6 font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>

        <a
          className="text-gray-500 text-sm leading-6 mt-10 block sm:text-center"
          href="https://www.flaticon.com/free-icons/bot"
          title="bot icons"
        >
          Bot icons created by Smashicons - Flaticon
        </a>

        <p className="mt-4 sm:text-center text-sm leading-5 text-gray-500">
          &copy; 2023 Techulus. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
