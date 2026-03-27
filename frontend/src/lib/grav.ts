import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { marked } from 'marked';

/** Convert a Markdown string to HTML. Returns empty string for falsy input. */
function md(value: string | undefined | null): string {
    if (!value) return '';
    return marked(value, { async: false }) as string;
}
/**
 * Base path to Grav's content pages directory.
 * Can be overridden via GRAV_PAGES_DIR environment variable (for server deployment).
 */
const GRAV_PAGES_DIR = process.env.GRAV_PAGES_DIR ?? path.resolve(
    import.meta.dirname ?? new URL('.', import.meta.url).pathname,
    '../../../cms/user/pages'
);

/**
 * Public URL base for Grav page media (images uploaded via Grav admin).
 * On the live server, Grav is installed under /cms/, so images are at /cms/user/pages/01.home/.
 * Can be overridden via GRAV_MEDIA_BASE environment variable for local development.
 */
export const GRAV_MEDIA_BASE = process.env.GRAV_MEDIA_BASE ?? '/cms/user/pages/01.home';

/**
 * Base path to Grav's user config directory.
 * Can be overridden via GRAV_CONFIG_DIR environment variable (for server deployment).
 */
const GRAV_CONFIG_DIR = process.env.GRAV_CONFIG_DIR ?? path.resolve(
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
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
    background_desaturate?: boolean | number | string;
    background_video_speed?: string | number;
    deco_color?: string;
    deco_width?: string | number;
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
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
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
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
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
    image?: string;
    cards?: SmartCateringCard[];
    accordion_bg_image?: string;
    accordion_bg_overlay?: boolean | number | string;
    accordion_bg_desaturate?: boolean | number | string;
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
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
}

/** About section data */
export interface AboutData {
    headline?: string;
    body?: string;
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
    /** Optional image shown in the right column of the About section */
    image?: string;
    quote?: string;
    quote_author?: string;
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
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
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
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
}

/** A single logo item */
export interface LogoItem {
    name: string;
    image?: string;
}

/** Logo section data */
export interface LogoSectionData {
    headline?: string;
    logo_color?: string;
    items?: LogoItem[];
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
}

/** Text section – centered headline + body paragraphs, optional background image */
export interface TextSectionData {
    headline?: string;
    paragraphs?: { text: string }[];
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
}

/** Split section – image left or right, text column on the other side */
export interface SplitSectionData {
    /** Controls which side the image appears. Defaults to 'left'. */
    image_position?: 'left' | 'right';
    overline?: string;
    headline?: string;
    subheadline?: string;
    body?: { text: string }[];
    cta_text?: string;
    cta_link?: string;
    image?: string;
    image_alt?: string;
}

/** A single card for the cards grid */
export interface CardsItem {
    title: string;
    text: string;
    image?: string;
}

/** Cards section data */
export interface CardsSectionData {
    overline?: string;
    headline?: string;
    subline?: string;
    items?: CardsItem[];
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
    background_grayscale?: boolean | number | string;
}


/** A single award / badge item */
export interface AwardsItem {
    image?: string;
    label?: string;
    description?: string;
}

/** Awards section data */
export interface AwardsData {
    headline?: string;
    items?: AwardsItem[];
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
}

/** Call to Action section data */
export interface CtaData {
    headline?: string;
    copy?: string;
    button_text?: string;
    button_link?: string;
    background_image?: string;
    background_video?: string;
    background_overlay?: boolean | number | string;
    illustration_image?: string;
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
    overline?: string;
    headline?: string;
    subline?: string;
    items?: StickyScrollItem[];
}

/** Menu Slider Item */
export interface MenuSliderItem {
    title: string;
    subtitle?: string;
    image?: string | object;
    video?: string | object;
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
    /** Array of CTA sections. Falls back to single `cta` for backward compat. */
    ctas?: CtaData[];
    about?: AboutData;
    team?: TeamData;
    faq?: FaqData;
    logo_section?: LogoSectionData;
    text_section?: TextSectionData;
    /** Array of split sections (Left/Right Image Full). Replaces the old singular split_section. */
    split_sections?: SplitSectionData[];
    /** @deprecated Use split_sections instead */
    split_section?: SplitSectionData;
    awards?: AwardsData;
    cards_section?: CardsSectionData;
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

    // Convert Markdown rich-text fields to HTML
    const solutions: SolutionsData | undefined = data.solutions
        ? {
            ...data.solutions,
            items: (data.solutions.items ?? []).map((item: SolutionItem) => ({
                ...item,
                challenge_text: md(item.challenge_text),
                solution_text: md(item.solution_text),
            })),
        }
        : undefined;

    const sections: ContentSection[] | undefined = (data.sections as ContentSection[] | undefined)?.map(
        (s) => ({ ...s, body: md(s.body) })
    );

    const smart_catering: SmartCateringData | undefined = data.smart_catering
        ? {
            ...data.smart_catering,
            columns: (data.smart_catering.columns ?? []).map((col: SmartCateringColumn) => ({
                ...col,
                accordions: (col.accordions ?? []).map((acc: SmartCateringAccordion) => ({
                    ...acc,
                    content: md(acc.content),
                })),
            })),
        }
        : undefined;

    const sticky_scroll: StickyScrollData | undefined = data.sticky_scroll
        ? {
            ...data.sticky_scroll,
            items: (data.sticky_scroll.items ?? []).map((item: StickyScrollItem) => ({
                ...item,
                body_bold: md(item.body_bold),
                body_text: md(item.body_text),
            })),
        }
        : undefined;

    const ctas: CtaData[] | undefined = data.ctas
        ? (data.ctas as CtaData[]).map((c: CtaData) => ({ ...c, copy: md((c as any).copy) }))
        : data.cta
            ? [{ ...data.cta, copy: md((data.cta as any).copy) }]
            : undefined;

    const about: AboutData | undefined = data.about
        ? { ...data.about, body: md(data.about.body) }
        : undefined;

    const team: TeamData | undefined = data.team
        ? {
            ...data.team,
            items: (data.team.items ?? []).map((m: TeamMember) => ({
                ...m,
                bio: md(m.bio),
            })),
        }
        : undefined;

    const faq: FaqData | undefined = data.faq
        ? {
            ...data.faq,
            items: (data.faq.items ?? []).map((item: FaqItem) => ({
                ...item,
                answer: md(item.answer),
            })),
        }
        : undefined;

    const text_section: TextSectionData | undefined = data.text_section
        ? {
            ...data.text_section,
            paragraphs: (data.text_section.paragraphs ?? []).map((p: { text: string }) => ({
                text: md(p.text),
            })),
        }
        : undefined;

    return {
        title: data.title ?? 'Untitled',
        section_order: data.section_order ?? undefined,
        hero: data.hero ?? undefined,
        sections,
        solutions,
        stats: data.stats ?? undefined,
        menu_slider: data.menu_slider ?? undefined,
        smart_catering,
        sticky_scroll,
        ctas,
        about,
        team,
        faq,
        logo_section: data.logo_section ?? undefined,
        text_section,
        split_sections: data.split_sections
            ? (data.split_sections as SplitSectionData[])
            : data.split_section
                ? [data.split_section as SplitSectionData]
                : undefined,
        split_section: data.split_section ?? undefined,
        awards: data.awards ?? undefined,
        cards_section: data.cards_section ?? undefined,
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

/** A section with optional bullet list for legal pages */
export interface LegalSection {
    title: string;
    body?: string;
    list_items?: { item: string }[];
    body_after?: string;
}

/** A single right entry for the Datenschutz rights list */
export interface DatenschutzRight {
    label: string;
}

/** Structured Impressum page data */
export interface ImpressumPage {
    title: string;
    meta_description?: string;
    company_name?: string;
    company_address?: string;
    company_representatives?: string;
    contact_phone?: string;
    contact_email?: string;
    register_court?: string;
    register_number?: string;
    eu_os_link?: string;
    sections?: LegalSection[];
}

/** Structured Datenschutz page data */
export interface DatenschutzPage {
    title: string;
    meta_description?: string;
    intro?: string;
    responsible_company?: string;
    responsible_address?: string;
    responsible_phone?: string;
    responsible_email?: string;
    responsible_authority?: string;
    responsible_dpo?: string;
    rights_intro?: string;
    rights?: DatenschutzRight[];
    rights_closing?: string;
    sections?: LegalSection[];
    last_updated?: string;
}

/**
 * Convenience: get Impressum content.
 */
export function getImpressum(): ImpressumPage | null {
    const filePath = path.join(GRAV_PAGES_DIR, '02.impressum', 'impressum.md');

    if (!fs.existsSync(filePath)) {
        console.warn(`[grav] Impressum not found: ${filePath}`);
        return null;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    return {
        title: (data.title as string) ?? 'Impressum',
        meta_description: data.meta_description as string | undefined,
        company_name: data.company_name as string | undefined,
        company_address: data.company_address as string | undefined,
        company_representatives: data.company_representatives as string | undefined,
        contact_phone: data.contact_phone as string | undefined,
        contact_email: data.contact_email as string | undefined,
        register_court: data.register_court as string | undefined,
        register_number: data.register_number as string | undefined,
        eu_os_link: data.eu_os_link as string | undefined,
        sections: (data.sections as LegalSection[] | undefined)?.map((s) => ({
            ...s,
            body: md(s.body),
        })),
    };
}

/**
 * Convenience: get Datenschutzerklärung content.
 */
export function getDatenschutz(): DatenschutzPage | null {
    const filePath = path.join(GRAV_PAGES_DIR, '03.datenschutz', 'datenschutz.md');

    if (!fs.existsSync(filePath)) {
        console.warn(`[grav] Datenschutz not found: ${filePath}`);
        return null;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    return {
        title: (data.title as string) ?? 'Datenschutzerklärung',
        meta_description: data.meta_description as string | undefined,
        intro: md(data.intro as string | undefined),
        responsible_company: data.responsible_company as string | undefined,
        responsible_address: data.responsible_address as string | undefined,
        responsible_phone: data.responsible_phone as string | undefined,
        responsible_email: data.responsible_email as string | undefined,
        responsible_authority: data.responsible_authority as string | undefined,
        responsible_dpo: data.responsible_dpo as string | undefined,
        rights_intro: data.rights_intro as string | undefined,
        rights: data.rights as DatenschutzRight[] | undefined,
        rights_closing: md(data.rights_closing as string | undefined),
        sections: (data.sections as LegalSection[] | undefined)?.map((s) => ({
            ...s,
            body: md(s.body),
            body_after: md(s.body_after),
        })),
        last_updated: data.last_updated as string | undefined,
    };
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

export interface HeaderSubmenuItem {
    label: string;
    link: string;
}

export interface HeaderMenuItem {
    label: string;
    link: string;
    submenus?: HeaderSubmenuItem[];
}

export interface HeaderConfig {
    logo?: string;
    cta_text?: string;
    cta_link?: string;
    menus?: HeaderMenuItem[];
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
    header?: HeaderConfig;
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
