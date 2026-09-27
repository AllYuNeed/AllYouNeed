import type { MockupKind } from "@/content/modules";
import { DashboardMock } from "./DashboardMock";
import { AccountingMock } from "./AccountingMock";
import { InventoryMock } from "./InventoryMock";
import { PosMock } from "./PosMock";
import { CrmMock } from "./CrmMock";
import { ItrMock } from "./ItrMock";

export { BrowserFrame } from "./BrowserFrame";
export { PhoneFrame } from "./PhoneFrame";
export { Toasts } from "./Toasts";
export { DashboardMock, AccountingMock, InventoryMock, PosMock, CrmMock, ItrMock };

const map = {
  dashboard: DashboardMock,
  accounting: AccountingMock,
  inventory: InventoryMock,
  pos: PosMock,
  crm: CrmMock,
  itr: ItrMock,
} as const;

export function MockupFor({ kind, compact, className }: { kind: MockupKind; compact?: boolean; className?: string }) {
  if (kind === "none") return null;
  const Comp = map[kind];
  return <Comp compact={compact} className={className} />;
}
