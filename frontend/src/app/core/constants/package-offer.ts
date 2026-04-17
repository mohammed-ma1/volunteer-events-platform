/** Must match `slug` in `EventSeeder` for the 100-workshop bundle. */
export const PACKAGE_100_EVENT_SLUG = 'package-100-workshops';

/** Active source-aligned 50-workshop bundles (matching screenshots). */
export const PACKAGE_PERSONAL_50_SLUG = 'package-personal-50';
export const PACKAGE_PROFESSIONAL_50_SLUG = 'package-professional-50';

/** Legacy hidden bundles — kept in DB for backward compat. */
export const PACKAGE_CAREER_PREP_SLUG = 'package-career-prep';
export const PACKAGE_SOFT_SKILLS_SLUG = 'package-soft-skills';
export const PACKAGE_AI_SLUG = 'package-ai';
export const PACKAGE_DIGITAL_SLUG = 'package-digital';

export const ALL_PACKAGE_SLUGS: readonly string[] = [
  PACKAGE_100_EVENT_SLUG,
  PACKAGE_PERSONAL_50_SLUG,
  PACKAGE_PROFESSIONAL_50_SLUG,
  PACKAGE_CAREER_PREP_SLUG,
  PACKAGE_SOFT_SKILLS_SLUG,
  PACKAGE_AI_SLUG,
  PACKAGE_DIGITAL_SLUG,
];
