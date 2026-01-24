import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT) || 587,
	secure: process.env.SMTP_SECURE === "true",
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export function getFromEmail() {
	const from = process.env.EMAIL_FROM;
	if (!from) {
		throw new Error("EMAIL_FROM environment variable is required");
	}
	return from;
}

interface SendEmailOptions {
	to: string;
	subject: string;
	html: string;
	text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
	await transporter.sendMail({
		from: getFromEmail(),
		to,
		subject,
		html,
		text,
	});
}
