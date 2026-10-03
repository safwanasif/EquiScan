import Navbar from "@/components/Navbar";
import AnimatedDocument from "@/components/AnimatedDocument";
import Link from "next/link";
import { CATEGORY_LIST } from "@/data/biasCategories";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-20 pb-24 lg:pt-28 lg:pb-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                  <span className="section-label">
                    Audit for Medical Content
                  </span>
                </div>

                <h1 className="font-serif text-[3.5rem] lg:text-[5rem] leading-[0.95] tracking-tightest mb-8">
                  The textbooks she studied
                  <br />
                  were not written
                  <br />
                  with <span className="italic text-rose">her</span> in mind.
                </h1>

                <p className="text-lg lg:text-xl text-muted leading-relaxed mb-10 max-w-xl">
                  EquiScan reads medical papers, textbook chapters, and
                  curricula to surface gender bias, then generates the content
                  that should have been there.
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <Link
                    href="/scan"
                    className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-4 text-base hover:bg-rose transition-colors rounded-sm group"
                  >
                    <span>Scan a document</span>
                  </Link>

                  <a
                    href="#how"
                    className="text-base text-ink border-b border-rose pb-0.5 hover:text-rose transition-colors"
                  >
                    Watch how it works
                  </a>
                </div>
              </div>

              <div className="relative">
                <AnimatedDocument />
              </div>
            </div>
          </div>

          <div className="border-t border-line bg-paperShade/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
              <div className="flex flex-wrap items-center justify-between gap-6 font-mono text-[11px] tracking-widest text-muted uppercase">
                <span>Built on Groq</span>
                <span className="hidden md:inline">-</span>
                <span>8-second analysis</span>
                <span className="hidden md:inline">-</span>
                <span>5 bias categories and 3 rewrite modes</span>
                <span className="hidden md:inline">-</span>
                <span>Human review required</span>
              </div>
            </div>
          </div>
        </section>

        <section id="problem" className="border-t border-line">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
            <p className="section-label mb-6">Designed for human review</p>
            <h2 className="font-serif text-5xl tracking-tight mb-8">Make assumptions easier to examine.</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                ["Read in context", "A male patient is not automatically a biased example. Review findings against the surrounding passage."],
                ["Inspect the source", "Each finding quotes the supplied text so you can assess the concern yourself."],
                ["Keep your judgment", "Suggested edits are drafts. EquiScan is not a clinically validated assessment or a substitute for expert review."],
              ].map(([title, detail]) => <div key={title} className="border-t border-line pt-6"><h3 className="font-serif text-2xl mb-3">{title}</h3><p className="text-muted leading-relaxed">{detail}</p></div>)}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="border-t border-line bg-paperShade/40">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
            <div className="mb-20 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                <span className="section-label">How It Works</span>
              </div>
              <h2 className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
                From source text to a reviewable report.
              </h2>
              <p className="text-lg text-muted leading-relaxed">
                Four steps. Text is processed by Groq. Signed-in scans are
                saved to your workspace.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              <div>
                <p className="font-serif text-3xl text-rose mb-4 italic">01</p>
                <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">
                  Upload
                </p>
                <h3 className="font-serif text-2xl leading-tight mb-3">
                  Drop in a chapter.
                </h3>
                <p className="text-sm text-ink/80 leading-relaxed">
                  Upload a PDF, paste raw text, or pick a sample document from
                  our library of medical excerpts.
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl text-rose mb-4 italic">02</p>
                <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">
                  Analyze
                </p>
                <h3 className="font-serif text-2xl leading-tight mb-3">
                  Review potential bias.
                </h3>
                <p className="text-sm text-ink/80 leading-relaxed">
                  Five bias categories, severity scoring, and a letter grade
                  across the whole document.
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl text-rose mb-4 italic">03</p>
                <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">
                  Review
                </p>
                <h3 className="font-serif text-2xl leading-tight mb-3">
                  Rewrite with context.
                </h3>
                <p className="text-sm text-ink/80 leading-relaxed">
                  Every flagged sentence comes with three rewrite options, from
                  conservative edits to comprehensive revisions.
                </p>
              </div>

              <div>
                <p className="font-serif text-3xl text-rose mb-4 italic">04</p>
                <p className="font-mono text-xs tracking-widest text-muted uppercase mb-3">
                  Draft
                </p>
                <h3 className="font-serif text-2xl leading-tight mb-3">
                  Prepare an editorial note.
                </h3>
                <p className="text-sm text-ink/80 leading-relaxed">
                  Generate a short addendum addressing flagged language. Review
                  every claim, save it with your audit, or include it in a report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* METHODOLOGY - 5 CATEGORIES */}
        <section id="categories" className="border-t border-line">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
            <div className="mb-20 max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                <span className="section-label">Methodology</span>
              </div>
              <h2 className="font-serif text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
                Five categories for editorial review.
              </h2>
              <p className="text-lg text-muted leading-relaxed">
                Review potential sex and gender concerns supported by the excerpt.
                These categories guide inspection; findings require human judgment.
              </p>
            </div>

            <div className="space-y-1">
              {CATEGORY_LIST.map((cat, i) => (
                <div
                  key={cat.id}
                  className="grid md:grid-cols-12 gap-6 py-10 border-t border-line"
                >
                  <div className="md:col-span-1">
                    <p className="font-serif text-2xl text-rose italic">
                      0{i + 1}
                    </p>
                  </div>
                  <div className="md:col-span-4">
                    <p className="font-mono text-[10px] tracking-widest text-muted uppercase mb-2">
                      {cat.shortLabel}
                    </p>
                    <h3 className="font-serif text-2xl leading-tight mb-3">
                      {cat.label}
                    </h3>
                    <p className="text-sm text-ink/80 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
                    <div className="bg-rose-soft/40 border-l-2 border-rose p-4">
                      <p className="font-mono text-[10px] tracking-widest text-rose uppercase mb-2">
                        Biased
                      </p>
                      <p className="font-serif text-sm text-ink/90 leading-relaxed">
                        {cat.examples[0].biased}
                      </p>
                    </div>
                    <div className="bg-paperShade border-l-2 border-ink p-4">
                      <p className="font-mono text-[10px] tracking-widest text-ink uppercase mb-2">
                        Improved
                      </p>
                      <p className="font-serif text-sm text-ink/90 leading-relaxed">
                        {cat.examples[0].improved}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PULL QUOTE */}
        <section className="border-t border-line bg-ink text-paper">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center">
            <p className="section-label text-paper/50 mb-10">
              On the scale of the problem
            </p>
            <blockquote className="font-serif text-4xl lg:text-6xl leading-[1.15] italic tracking-tight">
              It took until 2004 for the first American textbook on
              gender-specific medicine to be released.
            </blockquote>
            <p className="mt-10 font-mono text-xs tracking-widest text-paper/60 uppercase">
              Legato, M. Principles of Gender-Specific Medicine, 2004
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="border-t border-line">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 lg:py-32">
            <div className="border border-rose rounded-sm p-10 lg:p-16 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-rose" />
                <span className="section-label">Ready when you are</span>
              </div>
              <h2 className="font-serif text-4xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
                Review an excerpt.
                <br />
                Make your next edit clearer.
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-10 max-w-2xl mx-auto">
                Inspect quoted findings, record your review decisions, and export
                a report. Generated suggestions remain drafts for human review.
              </p>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 bg-ink text-paper px-8 py-4 text-base hover:bg-rose transition-colors rounded-sm"
              >
                <span>Begin an analysis</span>
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-line">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose" />
                <span className="font-serif text-lg tracking-tight">
                  EquiScan
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-muted uppercase">
                Hack Arizona 2026 - Built with Groq
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
