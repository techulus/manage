"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function MarkdownEditor({
  defaultValue,
  name = "description",
}: {
  defaultValue?: string;
  name?: string;
}) {
  const [value, onChange] = useState(defaultValue ?? "");

  const options = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "### Notes",
    };
  }, []);

  return (
    <>
      <input type="hidden" name={name} defaultValue={value} />
      <SimpleMDE options={options} value={value} onChange={onChange} />
    </>
  );
}
