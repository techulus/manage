import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 text-black dark:text-white">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Image
            src={logo}
            alt="Manage"
            width={32}
            height={32}
            className="-mt-2 mr-2 rounded-md"
          />

          <Link href="/" className="-m-1.5 p-1.5" prefetch={false}>
            <p className="hero text-heading relative">
              Manage
              <sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs">
                [beta]
              </sup>
            </p>
          </Link>
        </div>
      </nav>
    </header>
  );
}
