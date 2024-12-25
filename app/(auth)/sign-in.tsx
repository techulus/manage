"use client";

type Props = {
	onSignIn: () => Promise<void>;
};

const SignIn = ({ onSignIn }: Props) => {
	return (
		<button
			type="button"
			onClick={() => {
				onSignIn();
			}}
		>
			Console
		</button>
	);
};

export default SignIn;
