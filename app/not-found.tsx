import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AnimatedLogo } from "@/components/brand/AnimatedLogo";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <AnimatedLogo size={88} />
      <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-primary">404</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">That page isn&apos;t in the ledger.</h1>
      <p className="mt-4 max-w-md text-text-muted">The link may be old or mistyped. Everything you need is one click from the home page.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" arrow>Back to home</Button>
        <Button href="/contact/" variant="outline">Contact us</Button>
      </div>
    </Container>
  );
}
