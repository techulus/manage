import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

type Props = {
  appearance: string;
};

export const ThemedOrgSwitcher = ({ appearance }: Props) => {
  return (
    <OrganizationSwitcher
      appearance={appearance === "dark" ? { baseTheme: dark } : {}}
      afterSwitchOrganizationUrl="/console/projects"
    />
  );
};

export const ThemedUserButton = ({ appearance }: Props) => {
  return (
    <UserButton appearance={appearance === "dark" ? { baseTheme: dark } : {}} />
  );
};
