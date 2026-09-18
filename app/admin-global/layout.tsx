import { GlobalAdminShell } from "@/components/global-admin-shell"

export default function GlobalAdminLayout({ children }: { children: React.ReactNode }) {
  return <GlobalAdminShell>{children}</GlobalAdminShell>
}
