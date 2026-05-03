import { ChildAppChrome } from "@/components/anyu/child/ChildAppChrome";
import { ChildDashboardContent } from "@/components/anyu/child/ChildDashboardContent";
import { getDashboard } from "@/lib/child-insights/repository";

export const dynamic = "force-dynamic";

const ELDER_DEMO = "elder_demo";

export default async function ChildDashboardRoutePage() {
  const card = await getDashboard(ELDER_DEMO, "妈妈");
  return (
    <ChildAppChrome>
      <ChildDashboardContent card={card} elderUserId={ELDER_DEMO} />
    </ChildAppChrome>
  );
}
