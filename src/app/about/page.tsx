import type { Metadata } from "next";
import Link from "next/link";
import { isAiScreeningEnabled } from "@/lib/moderation";
import SupportCallout from "@/components/SupportCallout";

export const metadata: Metadata = {
  title: "About",
  description:
    "What the Global Kindness Map is, how it's moderated, and why it has no accounts, no ranking and no algorithm.",
};

const FAQ = [
  {
    q: "Do I need an account?",
    a: "No. There is no sign-up, no email field and no profile. A pin carries a place, a category, a story and a timestamp — nothing about who wrote it.",
  },
  {
    q: "What gets blocked?",
    a: "Every submission is checked server-side before it is saved: length limits, a profanity filter, a link/spam guard, coordinate sanity checks, and a per-IP rate limit. The browser can only ever read from the database — it can never write to it.",
  },
  {
    q: "Is anything read by a machine?",
    a: "__MODERATION__",
  },
  {
    q: "Can I delete something I posted?",
    a: "Not yet, and that is a real gap. Because pins are anonymous there is nothing to prove authorship with. A moderation queue is on the list of things worth contributing.",
  },
  {
    q: "Is it really free?",
    a: "Yes, and open source under the MIT licence. The whole stack was chosen to run at zero cost at side-project scale: OpenStreetMap data and tiles, a free Postgres tier, and a free host.",
  },
];

const PRINCIPLES = [
  {
    title: "No ranking",
    body: "Stories appear newest-first and that is the whole ordering. Nothing is boosted, nothing is buried, nothing is optimised for how long you stay.",
  },
  {
    title: "No identity",
    body: "Anonymous by construction, not by setting. There is no author field in the database, so there is nothing to leak or to farm.",
  },
  {
    title: "No lock-in",
    body: "It is a public map of public good. The code is MIT, the schema is one SQL file, and the map data belongs to OpenStreetMap.",
  },
];

const AI_SCREENING_YES =
  "Yes. Submissions are passed through a content-moderation model that " +
  "screens for hate, threats and sexual content — it reads the message " +
  "and nothing else, and the message is already public once posted. It is " +
  "deliberately not set to reject stories that merely mention distress or " +
  "an accident, because those are often the kindest ones here.";

const AI_SCREENING_NO =
  "Not on this deployment. Submissions are screened by a local word-list " +
  "filter and a set of rules, all running on this server — nothing is sent " +
  "anywhere else.";

export default function AboutPage() {
  const faq = FAQ.map((item) =>
    item.a === "__MODERATION__"
      ? {
          ...item,
          a: isAiScreeningEnabled() ? AI_SCREENING_YES : AI_SCREENING_NO,
        }
      : item
  );

  return (
    <div className="mx-auto max-w-3xl px-5 pt-14 pb-4 sm:px-8 sm:pt-20">
      <header>
        <p className="eyebrow">About</p>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.4rem)] leading-[1.02] text-balance text-paper">
          A map that only records good news
        </h1>
      </header>

      <div className="mt-10 space-y-6 text-[1.05rem] leading-[1.75] text-paper-dim">
        <p className="first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[3.4rem] first-letter:leading-[0.8] first-letter:text-glow">
          Global Kindness Map is a live world map built entirely out of real
          acts of kindness that people chose to write down. Someone helped a
          stranger with their shopping. Someone fixed the lamp on the corner.
          Someone sat with a person who was crying on a train. Each one gets a
          light on the map and a page of its own.
        </p>
        <p>
          The premise is small and slightly stubborn: almost everything that
          gets mapped at global scale is a record of harm — outbreaks, strikes,
          conflicts, outages. Very little is built to notice the opposite,
          which happens constantly and leaves no trace. This is the opposite.
        </p>
        <p>
          Nothing here is verified, and that is deliberate. Verification would
          mean identity, and identity would mean accounts, and accounts would
          mean the whole thing turning into somewhere you perform being good
          rather than somewhere you note it happening. The trade is honest:
          you get a record that anyone can add to, and you read it knowing
          exactly what it is.
        </p>
      </div>

      <div className="hairline my-14" />

      <section aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="font-display text-2xl text-paper">
          Three rules it holds to
        </h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="bg-ink-2 p-6">
              <h3 className="font-display text-lg text-glow">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-16">
        <h2 id="faq-heading" className="font-display text-2xl text-paper">
          Questions
        </h2>
        <dl className="mt-6 divide-y divide-line-soft border-y border-line-soft">
          {faq.map((item) => (
            <div key={item.q} className="py-6">
              <dt className="font-display text-lg text-paper">{item.q}</dt>
              <dd className="mt-2 leading-relaxed text-paper-dim">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SupportCallout className="mt-16" />

      <section className="panel mt-8 px-7 py-10 text-center">
        <p className="eyebrow">Your turn</p>
        <h2 className="mt-4 font-display text-2xl text-balance text-paper">
          The map is only as full as people make it
        </h2>
        <Link href="/add" className="btn-glow mt-7 px-7 py-3.5 text-[0.95rem]">
          Add your light
        </Link>
      </section>
    </div>
  );
}
