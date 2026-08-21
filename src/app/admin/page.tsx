import type {
  Metadata,
} from "next";

import {
  AdminDashboard,
} from "@/components/Admin";

export const metadata:
  Metadata = {
  title:
    "Administração",

  description:
    "Monitoramento interno do World Newspaper.",

  robots: {
    index:
      false,

    follow:
      false,

    nocache:
      true,
  },
};

export default function AdminPage() {
  return (
    <main
      className="
        min-h-screen
        bg-background
        px-4 py-8
        sm:px-6
        lg:px-10
      "
    >
      <AdminDashboard />
    </main>
  );
}
