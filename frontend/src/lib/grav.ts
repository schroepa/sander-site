import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
/**
 * Base path to Grav's content pages directory.
 * Works from both `frontend/` (dev) and build contexts.
 */
const GRAV_PAGES_DIR = path.resolve(
    import.meta.dirname ?? new URL('.', import.meta.url).pathname,
    '../../../cms/user/pages'
);

/**
 * Base path to Grav's user config directory.
 */
const GRAV_CONFIG_DIR = path.resolve(
    import.meta.dirname ?? new URL('.', import.meta.url).pathname,
    '../../../cms/user/config'
);

/** Represents a content section from Grav frontmatter */
export interface ContentSection {
    title: string;
    body: string;
    image?: string;
    tags?: string[];
}

/** Represents the hero block from Grav frontmatter */
export interface HeroData {
    headline: string;
    subline?: string;
    spotlight_text?: string;
    spotlight_line_height?: string;
    spotlight_blur?: string;
    spotlight_softness?: string;
    cta_text?: string;
    cta_link?: string;
    show_cta?: boolean | string | number;
    headline_scale?: string;
    subline_scale?: string;
    headline_subline_spacing?: string;
}

/** A single challenge/solution pair */
export interface SolutionItem {
    challenge_title: string;
    challenge_text: string;
    solution_title: string;
    solution_text: string;
}

/** Solutions section data */
export interface SolutionsData {
    headline: string;
    subline?: string;
    items: SolutionItem[];
}

/** A single stat/counter item */
export interface StatsItem {
    value: number;
    suffix: string;
    separator?: boolean;
    label: string;
}

/** Stats section data */
export interface StatsData {
    items: StatsItem[];
}

/** A single smart catering card */
export interface SmartCateringCard {
    title: string;
    text: string;
}

/** A single smart catering accordion */
export interface SmartCateringAccordion {
    title: string;
    content?: string;
    tags?: string[];
    cards?: SmartCateringCard[];
}

/** A single smart catering column */
export interface SmartCateringColumn {
    title: string;
    subline?: string;
    accordions: SmartCateringAccordion[];
}

/** Smart catering section data */
export interface SmartCateringData {
    headline?: string;
    title?: string;
    subline?: string;
    columns: SmartCateringColumn[];
}

/** Call to Action section data */
export interface CtaData {
    headline?: string;
    copy?: string;
    button_text?: string;
    button_link?: string;
}

/** Sticky Scroll Item */
export interface StickyScrollItem {
    dropdown_label?: string;
    title?: string;
    subtitle?: string;
    body_bold?: string;
    body_text?: string;
}

/** Sticky Scroll Section Data */
export interface StickyScrollData {
    headline?: string;
    subline?: string;
    items?: StickyScrollItem[];
}

/** Full page data returned from a Grav content file */
export interface GravPage {
    title: string;
    hero?: HeroData;
    sections?: ContentSection[];
    solutions?: SolutionsData;
    stats?: StatsData;
    smart_catering?: SmartCateringData;
    sticky_scroll?: StickyScrollData;
    cta?: CtaData;
    /** Raw markdown body content (below the frontmatter) */
    body: string;
    /** All frontmatter data as-is */
    raw: Record<string, unknown>;
}

/**
 * Read and parse a Grav content page by its folder slug.
 *
 * @param slug - The page folder name, e.g. '01.home'
 * @param template - The template/blueprint name, e.g. 'homepage'
 * @returns Parsed page data, or null if not found
 */
export function getPage(slug: string, template = 'default'): GravPage | null {
    const filePath = path.join(GRAV_PAGES_DIR, slug, `${template}.md`);

    if (!fs.existsSync(filePath)) {
        console.warn(`[grav] Page not found: ${filePath}`);
        return null;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    return {
        title: data.title ?? 'Untitled',
        hero: data.hero ?? undefined,
        sections: data.sections ?? undefined,
        solutions: data.solutions ?? undefined,
        stats: data.stats ?? undefined,
        smart_catering: data.smart_catering ?? undefined,
        sticky_scroll: data.sticky_scroll ?? undefined,
        cta: data.cta ?? undefined,
        body: content.trim(),
        raw: data,
    };
}

/**
 * Convenience: get the homepage content.
 */
export function getHomepage(): GravPage | null {
    return getPage('01.home', 'homepage');
}

/**
 * List all page slugs available in the Grav pages directory.
 */
export function listPages(): string[] {
    if (!fs.existsSync(GRAV_PAGES_DIR)) return [];

    return fs
        .readdirSync(GRAV_PAGES_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
        .map((d) => d.name);
}

/** Global Site Configuration interfaces */

export interface FooterMenuItem {
    label: string;
    link: string;
}

export interface FooterSocialItem {
    platform: string;
    link: string;
    icon?: string;
}

export interface FooterConfig {
    menus?: FooterMenuItem[];
    socials?: FooterSocialItem[];
    copyright?: string;
}

export interface SiteConfig {
    title?: string;
    author?: {
        name?: string;
        email?: string;
    };
    metadata?: {
        description?: string;
    };
    footer?: FooterConfig;
}

/**
 * Read and parse the Grav site config
 */
export function getSiteConfig(): SiteConfig | null {
    const filePath = path.join(GRAV_CONFIG_DIR, 'site.yaml');

    if (!fs.existsSync(filePath)) {
        console.warn(`[grav] Site config not found: ${filePath}`);
        return null;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const data = yaml.load(raw) as SiteConfig;
        return data || null;
    } catch (e) {
        console.error(`[grav] Error parsing site config`, e);
        return null;
    }
}
