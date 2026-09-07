import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
