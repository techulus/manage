import { useEffect, useRef, useState } from "react";

export function useSticky() {
	const [isSticky, setIsSticky] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (ref.current) {
				const { top } = ref.current.getBoundingClientRect();
				setIsSticky(top <= 0);
			}
		};

		window.addEventListener("scroll", handleScroll);
		// Initial check
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return { ref, isSticky };
}
