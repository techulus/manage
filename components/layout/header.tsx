import { SignedIn, SignedOut } from "@clerk/nextjs";
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

          <Link href="/" className="-m-1.5 p-1.5">
            <p className="hero relative">
              Manage
              <sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs">
                [beta]
              </sup>
            </p>
          </Link>
        </div>
        {/* <div className="hidden lg:flex lg:flex-1 lg:justify-end"> */}
        {/*   <SignedIn> */}
        {/*     <Link */}
        {/*       href="/console/projects" */}
        {/*       className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200" */}
        {/*     > */}
        {/*       Console <span aria-hidden="true">&rarr;</span> */}
        {/*     </Link> */}
        {/*   </SignedIn> */}
        {/*   <SignedOut> */}
        {/*     <Link */}
        {/*       href="/console/projects" */}
        {/*       className="text-sm font-semibold leading-6 text-gray-900" */}
        {/*     > */}
        {/*       Log in <span aria-hidden="true">&rarr;</span> */}
        {/*     </Link> */}
        {/*   </SignedOut> */}
        {/* </div> */}
      </nav>
    </header>
  );
}
