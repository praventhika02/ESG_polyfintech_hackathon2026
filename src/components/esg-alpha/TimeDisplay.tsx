"use client";

import { useEffect, useState } from "react";

export function TimeDisplay({ value }: { value: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date(value).toLocaleTimeString());
  }, [value]);

  return <span>{time || "-"}</span>;
}
