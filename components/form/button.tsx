"use client";

import { CheckIcon, TrashIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";
import { Button } from "../ui/button";

export const DeleteButton = ({
	action = "Delete",
	className = "",
	variant = "ghost",
	compact = false,
}: {
	action?: string;
	className?: string;
	variant?: "outline" | "ghost";
	compact?: boolean;
}) => {
	const pathname = usePathname();
	const { pending } = useFormStatus();

	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	if (showConfirmDelete) {
		return (
			<>
				<input type="hidden" name="currentPath" value={pathname} />
				<Button
					type="submit"
					variant="destructive"
					size={compact ? "sm" : "default"}
					className={className}
				>
					{pending ? (
						<Spinner message="Processing..." />
					) : (
						<>
							{!compact ? (
								<CheckIcon className="mr-2 h-5 w-5" aria-hidden="true" />
							) : null}
							Confirm {action}
						</>
					)}
				</Button>
			</>
		);
	}

	return (
		<Button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				setShowConfirmDelete(true);
			}}
			variant={variant}
			size={compact ? "sm" : "default"}
			className={className}
		>
			{!compact ? (
				<TrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
			) : null}
			{action}
		</Button>
	);
};

export const SaveButton = ({
	icon = null,
	label = "Save",
	loadingLabel = "Saving",
	disabled = false,
}: {
	icon?: React.ReactElement | null;
	label?: string;
	loadingLabel?: string;
	disabled?: boolean;
}) => {
	const { pending } = useFormStatus();

	return (
		<Button type="submit" disabled={pending || disabled}>
			{pending ? (
				<Spinner message={loadingLabel} className="text-muted" />
			) : (
				<>
					{icon}
					{label}
				</>
			)}
		</Button>
	);
};

export const ActionButton = ({
	icon = null,
	label = "Save",
	loadingLabel = "Saving",
	disabled = false,
	size = "default",
	variant = "default",
	className = "",
}: {
	icon?: React.ReactElement | null;
	label?: string;
	loadingLabel?: string;
	disabled?: boolean;
	size?: "default" | "sm";
	variant?: "default" | "outline" | "secondary" | "ghost" | "link";
	className?: string;
}) => {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			variant={variant}
			disabled={pending || disabled}
			size={size}
			className={className}
		>
			{pending ? (
				<Spinner message={loadingLabel} className="text-muted" />
			) : (
				<>
					{icon}
					{label}
				</>
			)}
		</Button>
	);
};

export const ConfirmButton = ({
	label = "",
	confirmLabel = "",
	variant = "outline",
	confirmVariant = "destructive",
	disabled = false,
	className = "",
	size = "sm",
	onClick,
}: {
	label?: string;
	variant?: "outline" | "default" | "destructive";
	confirmLabel?: string;
	confirmVariant?: "outline" | "default" | "destructive";
	disabled?: boolean;
	className?: string;
	size?: "sm" | "default";
	onClick: () => void;
}) => {
	const [showConfirm, setShowConfirm] = useState(false);

	if (showConfirm) {
		return (
			<Button
				variant={confirmVariant}
				size={size}
				className={className}
				onClick={() => {
					onClick();
					setShowConfirm(false);
				}}
				disabled={disabled}
			>
				{confirmLabel}
			</Button>
		);
	}

	return (
		<Button
			type="button"
			onClick={() => setShowConfirm(true)}
			variant={variant}
			size={size}
			className={className}
			disabled={disabled}
		>
			{label}
		</Button>
	);
};
