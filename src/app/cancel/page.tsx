import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] backdrop-blur sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-sm text-amber-100">
            Checkout cancelled
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            No worries — you weren’t charged.
          </h1>
          <p className="mt-3 text-base leading-7 text-white/70">
            If you’d like to try again, head back to the form and generate your
            report when you’re ready.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-violet-300 to-violet-500 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-violet-500/20 transition"
            >
              Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

