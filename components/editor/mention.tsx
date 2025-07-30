import { createReactInlineContentSpec } from "@blocknote/react";

export const Mention = createReactInlineContentSpec(
	{
		type: "mention",
		propSchema: {
			userId: {
				default: "",
			},
			userName: {
				default: "Unknown",
			},
		},
		content: "none",
	},
	{
		render: (props) => (
			<span
				className="bg-primary/10 text-primary px-1 rounded"
				data-user-id={props.inlineContent.props.userId}
			>
				@{props.inlineContent.props.userName}
			</span>
		),
	},
);
