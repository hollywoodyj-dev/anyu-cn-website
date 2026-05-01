import Link from "next/link";
import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ContactsClient } from "./ContactsClient";

export const dynamic = "force-dynamic";

export default function ChildContactsPage() {
  return (
    <ChildAppChrome>
      <h1 className="text-2xl font-semibold mb-1">联系人</h1>
      <p className="text-sm text-[var(--anyu-ink-muted)] mb-6">
        用于风险与提醒的接收顺序。此处为 V1.1 示意配置，数据保存在服务端（按 elderUserId）。
      </p>
      <ContactsClient />
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/cn/child/consent" className="rounded-full border px-4 py-2 text-sm">
          授权与说明
        </Link>
        <Link href="/cn/child" className="rounded-full border px-4 py-2 text-sm">
          返回总览
        </Link>
      </div>
    </ChildAppChrome>
  );
}
