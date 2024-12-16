import { useEffect, useRef, useState } from "react";

export const useDetectSticky = (
	// biome-ignore lint/suspicious/noExplicitAny: todo
	ref?: any,
	observerSettings = { threshold: [1] },
) => {
	const [isSticky, setIsSticky] = useState(false);
	const newRef = useRef(null);
	// biome-ignore lint/style/noParameterAssign: todo
	ref ||= newRef;

	// mount
	useEffect(() => {
		const cachedRef = ref.current;
		const observer = new IntersectionObserver(
			([e]) => setIsSticky(e.intersectionRatio < 1),
			observerSettings,
		);

		observer.observe(cachedRef);

		// unmount
		return () => {
			observer.unobserve(cachedRef);
		};
	}, [observerSettings, ref]);

	return [isSticky, ref, setIsSticky];
};
