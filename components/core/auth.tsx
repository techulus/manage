import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

type Props = {
  appearance: string;
};

export const ThemedOrgSwitcher = ({ appearance }: Props) => {
  return (
    <OrganizationSwitcher
      appearance={appearance === "dark" ? { baseTheme: dark } : {}}
      afterSelectOrganizationUrl="/console/projects"
      afterSelectPersonalUrl="/console/projects"
    />
  );
};

export const ThemedUserButton = ({ appearance }: Props) => {
  return (
    <UserButton appearance={appearance === "dark" ? { baseTheme: dark } : {}} />
  );
};
