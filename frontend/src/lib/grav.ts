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

/** About section data */
export interface AboutData {
    headline?: string;
    body?: string;
    background_image?: string;
    /** Optional image shown in the right column of the About section */
    image?: string;
}

/** A single team member */
export interface TeamMember {
    name: string;
    role?: string;
    bio?: string;
    image?: string;
}

/** Team section data */
export interface TeamData {
    headline?: string;
    subline?: string;
    items: TeamMember[];
}

/** A single FAQ item */
export interface FaqItem {
    question: string;
    answer: string;
}

/** FAQ section data */
export interface FaqData {
    headline?: string;
    items: FaqItem[];
}

/** Text section – centered headline + body paragraphs, optional background image */
export interface TextSectionData {
    headline?: string;
    paragraphs?: { text: string }[];
    background_image?: string;
}

/** Split section – left text column, right bleed image */
export interface SplitSectionData {
    overline?: string;
    headline?: string;
    subheadline?: string;
    body?: { text: string }[];
    cta_text?: string;
    cta_link?: string;
    image?: string;
    image_alt?: string;
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

/** Menu Slider Item */
export interface MenuSliderItem {
    title: string;
    subtitle?: string;
    image?: string;
}

/** Menu Slider Section Data */
export interface MenuSliderData {
    headline?: string;
    items?: MenuSliderItem[];
}

/** Section order entry – one item per orderable section */
export interface SectionOrderItem {
    section: string;
}

/** Full page data returned from a Grav content file */
export interface GravPage {
    title: string;
    section_order?: SectionOrderItem[];
    hero?: HeroData;
    sections?: ContentSection[];
    solutions?: SolutionsData;
    stats?: StatsData;
    menu_slider?: MenuSliderData;
    smart_catering?: SmartCateringData;
    sticky_scroll?: StickyScrollData;
    cta?: CtaData;
    about?: AboutData;
    team?: TeamData;
    faq?: FaqData;
    text_section?: TextSectionData;
    split_section?: SplitSectionData;
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
        section_order: data.section_order ?? undefined,
        hero: data.hero ?? undefined,
        sections: data.sections ?? undefined,
        solutions: data.solutions ?? undefined,
        stats: data.stats ?? undefined,
        menu_slider: data.menu_slider ?? undefined,
        smart_catering: data.smart_catering ?? undefined,
        sticky_scroll: data.sticky_scroll ?? undefined,
        cta: data.cta ?? undefined,
        about: data.about ?? undefined,
        team: data.team ?? undefined,
        faq: data.faq ?? undefined,
        text_section: data.text_section ?? undefined,
        split_section: data.split_section ?? undefined,
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

/** Minimal data shape for legal pages (Impressum, Datenschutz) */
export interface LegalPage {
    title: string;
    meta_description?: string;
    body: string;
}

/**
 * Read a single legal page (Impressum / Datenschutz) from its Grav content file.
 */
function getLegalPage(folder: string, template: string): LegalPage | null {
    const filePath = path.join(GRAV_PAGES_DIR, folder, `${template}.md`);

    if (!fs.existsSync(filePath)) {
        console.warn(`[grav] Legal page not found: ${filePath}`);
        return null;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    return {
        title: (data.title as string) ?? 'Untitled',
        meta_description: data.meta_description as string | undefined,
        body: content.trim(),
    };
}

/**
 * Convenience: get Impressum content.
 */
export function getImpressum(): LegalPage | null {
    return getLegalPage('02.impressum', 'impressum');
}

/**
 * Convenience: get Datenschutzerklärung content.
 */
export function getDatenschutz(): LegalPage | null {
    return getLegalPage('03.datenschutz', 'datenschutz');
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
