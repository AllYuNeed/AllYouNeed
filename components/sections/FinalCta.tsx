import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { MagneticButton } from "@/components/motion/MagneticButton";

type Props = { title?: string; body?: string };

export function FinalCta({ title = "Run your whole business on Allyouneed.", body = "Free for up to five users. Import from Tally or Excel in an afternoon. Cancel any time." }: Props) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal variant="scaleIn">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#6A61CF] to-[#7F77DD] dark:from-primary-solid dark:via-[#5A51C0] dark:to-[#4B43A6] px-6 py-16 text-center text-white shadow-lift sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 dot-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div aria-hidden="true" className="absolute -left-20 -top-20 size-72 rounded-full bg-accent/30 blur-3xl animate-aurora" />
            <div aria-hidden="true" className="absolute -bottom-24 -right-16 size-72 rounded-full bg-white/20 blur-3xl animate-aurora [animation-delay:-8s]" />
            <div className="relative">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">{title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85 dark:text-white">{body}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <MagneticButton>
                  <Button href="/register/" size="lg" variant="secondary" arrow className="bg-white text-primary-solid hover:bg-white dark:bg-white dark:text-primary-solid">Start free</Button>
                </MagneticButton>
                <MagneticButton strength={0.15}>
                  <Button href="/contact/" size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:border-white hover:text-white dark:bg-black/10">Book a demo</Button>
                </MagneticButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
