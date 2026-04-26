import { TextBlock } from "@/components/anyu";

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-medium text-[var(--anyu-ink)] md:text-3xl">
          关于我们
        </h1>
      </header>

      <TextBlock>
        <p>我们做安语，是因为发现：</p>
        <p className="pt-2">很多家庭的问题，不是没有爱，而是说不出来。</p>
        <p className="pt-2">我们只是想让那些话，更容易被听见一点。</p>
      </TextBlock>
    </div>
  );
}
