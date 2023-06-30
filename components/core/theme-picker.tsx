"use client";

import { updateTheme } from "@/app/console/settings/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { Button } from "../ui/button";

type Props = {
  currentTheme: string;
};

export const ThemePicker = ({ currentTheme }: Props) => {
  const [theme, setTheme] = useState(currentTheme ?? "light");

  return (
    <form
      action={async (formData) => {
        try {
          await updateTheme(formData);
          window?.location.reload();
        } catch (e) {
          console.error(e);
        }
      }}
      className="flex w-full"
    >
      <Select
        name="theme"
        value={theme}
        onValueChange={(val) => {
          setTheme(val);
        }}
      >
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="link" className="ml-auto">
        Save
      </Button>
    </form>
  );
};
