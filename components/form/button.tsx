"use client";

import { CheckIcon, TrashIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { Spinner } from "../core/loaders";
import { Button } from "../ui/button";

export const DeleteButton = () => {
  const { pending } = useFormStatus();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (showConfirmDelete) {
    return (
      <Button type="submit" variant="destructive">
        {pending ? (
          <Spinner message="Deleting..." />
        ) : (
          <>
            <CheckIcon className="mr-2 h-5 w-5" aria-hidden="true" />
            Confirm Delete
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        setShowConfirmDelete(true);
      }}
      variant="ghost"
    >
      <TrashIcon className="mr-2 h-5 w-5" aria-hidden="true" />
      Delete
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
        <Spinner message={loadingLabel} />
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
}: {
  className?: string;
  icon?: React.ReactElement | null;
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
}) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost" disabled={pending || disabled}>
      {pending ? (
        <Spinner message={loadingLabel} />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
};

export const UpdateProfileButton = () => (
  <Button
    type="button"
    variant="link"
    onClick={() => {
      // @ts-ignore
      if (window?.Clerk) {
        // @ts-ignore
        window.Clerk.openUserProfile();
      }
    }}
  >
    Update
  </Button>
);
