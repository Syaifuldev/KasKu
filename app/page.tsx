import { redirect } from "next/navigation";

/**
 * Root page — redirect ke /workspaces
 */
export default function RootPage() {
  redirect("/workspaces");
}
