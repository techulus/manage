import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/drizzle/types";
import { useState, useMemo } from "react";
import { Assignee } from "./assigee";

export function AssignToUser({
  users,
  onUpdate,
}: {
  users: User[];
  onUpdate: (userId: string) => void;
}) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const assignedTo = useMemo(() => {
    return value
      ? users.find((user) => user.id === value)?.firstName
      : "Select user...";
  }, [value, users]);

  if (!isAssigning) {
    return (
      <button
        className="mr-4 text-teal-600"
        onClick={async () => {
          setIsAssigning(true);
        }}
      >
        Assign
      </button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {assignedTo}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandEmpty>No user found.</CommandEmpty>
          <CommandGroup>
            {users.map((user: User) => (
              <CommandItem
                key={user.id}
                value={user.id}
                onSelect={async (currentValue) => {
                  const actualValue =
                    users.find((user) => user.id.toLowerCase() === currentValue)
                      ?.id ?? "";
                  onUpdate(actualValue);
                  setValue(actualValue === value ? "" : currentValue);
                  setOpen(false);
                  setIsAssigning(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === user.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <Assignee user={user} />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
