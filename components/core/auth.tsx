import { logout, switchOrganization } from "@/app/(auth)/actions";
import { Organization } from "@/ops/types";
import { ChevronsUpDown, Plus, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const OrgSwitcher = ({
  orgs,
  activeOrg,
}: {
  orgs: Organization[];
  activeOrg: Organization | undefined;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between"
        >
          <span className="truncate">{activeOrg?.name ?? "Personal"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <form action={switchOrganization}>
            <button type="submit" className="flex w-full">
              Personal
            </button>
          </form>
        </DropdownMenuItem>
        {orgs.map((org) => (
          <DropdownMenuItem key={org.id} asChild>
            <form key={org.id} action={switchOrganization}>
              <input type="hidden" name="id" value={org.id} />
              <button
                type="submit"
                className="flex w-full"
                disabled={activeOrg?.id === org.id}
              >
                {org.name}
              </button>
            </form>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {activeOrg ? (
          <DropdownMenuItem asChild>
            <Link href="#" className="flex items-center justify-between">
              Invite Members
              <Plus className="ml-2 h-4 w-4" />
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="#" className="flex items-center justify-between">
              Create Organization
              <Plus className="ml-2 h-4 w-4" />
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const UserButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/console/settings" className="w-full">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <form action={logout}>
            <button type="submit">Sign Out</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
