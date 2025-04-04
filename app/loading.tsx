import { Spinner } from "@/components/core/loaders";
import Image from "next/image";
import logo from "../public/images/logo.png";

export default function Loading() {
	return (
		<div className="flex min-h-screen w-full items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<Image src={logo} alt="Manage" width={48} height={48} />
				<Spinner className="mt-6" />
			</div>
		</div>
	);
}
