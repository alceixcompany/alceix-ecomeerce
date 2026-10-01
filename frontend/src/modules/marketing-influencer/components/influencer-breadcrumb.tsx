import Link from "next/link";
export function InfluencerBreadcrumb() {
return (
<section className="w-full bg-surface-container-lowest shadow-sm py-4" aria-label="Sayfa yolu">
<div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4">
<div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
<Link className="hover:text-primary transition-colors flex items-center gap-1.5" href="/">
<span className="material-symbols-outlined text-[18px]" aria-hidden="true">
{"home"}
</span>
{" Ana Sayfa "}
</Link>
<span className="text-outline-variant font-bold">
{"/"}
</span>
<span className="text-on-surface font-semibold">
{"Influencer Partner Programı"}
</span>
</div>
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse">

</span>
{" ALCEIX INFLUENCER & CREATOR NETWORK "}
</div>
</div>
</section>
);
}
