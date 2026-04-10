export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export async function loadGsap(): Promise<typeof import('gsap').default | null> {
  if (prefersReducedMotion()) {
    return null;
  }

  const mod = await import('gsap');

  return mod.default;
}
