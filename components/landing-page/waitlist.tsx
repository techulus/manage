import Script from "next/script";

const cssLoader = `
let head = document.getElementsByTagName('HEAD')[0];
let link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.css';
head.appendChild(link);
`;

export default function Waitlist() {
	return (
		<>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: workaround for nextjs */}
			<Script type="" dangerouslySetInnerHTML={{ __html: cssLoader }} />

			<Script src="https://prod-waitlist-widget.s3.us-east-2.amazonaws.com/getwaitlist.min.js" />

			<div
				id="getWaitlistContainer"
				data-waitlist_id="24963"
				data-widget_type="WIDGET_2"
			/>
		</>
	);
}
