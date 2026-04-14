export interface ParsedScanContent {
    intro: string[];
    culturalStory: string[];
    ingredients: string[];
    steps: string[];
    tips: string[];
    fallbackSections: Array<{
        title: string;
        lines: string[];
    }>;
}

const removeDiacritics = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

const toParagraphs = (rawLines: string[]): string[] => {
    const paragraphs: string[] = [];
    let bucket: string[] = [];

    for (const rawLine of rawLines) {
        const line = rawLine.trim();

        if (!line) {
            if (bucket.length > 0) {
                paragraphs.push(bucket.join(' '));
                bucket = [];
            }
            continue;
        }

        bucket.push(line.replace(/^\s*[-*]\s*/, '').trim());
    }

    if (bucket.length > 0) {
        paragraphs.push(bucket.join(' '));
    }

    return paragraphs;
};

const toListItems = (rawLines: string[]): string[] =>
    rawLines
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^\s*(?:[-*]|\d+\.)\s*/, '').trim())
        .filter(Boolean);

export const parseScanContent = (content: string): ParsedScanContent => {
    const fallback: ParsedScanContent = {
        intro: [],
        culturalStory: [],
        ingredients: [],
        steps: [],
        tips: [],
        fallbackSections: [],
    };

    if (!content.trim()) {
        return fallback;
    }

    const introLines: string[] = [];
    const sections = new Map<string, string[]>();
    let activeSection: string | null = null;

    for (const rawLine of content.split(/\r?\n/)) {
        const heading = rawLine.match(/^###\s+(.+)$/);
        if (heading) {
            activeSection = heading[1].trim();
            if (!sections.has(activeSection)) {
                sections.set(activeSection, []);
            }
            continue;
        }

        if (activeSection) {
            sections.get(activeSection)?.push(rawLine);
        } else {
            introLines.push(rawLine);
        }
    }

    const parsed: ParsedScanContent = {
        ...fallback,
        intro: toParagraphs(introLines),
    };

    for (const [title, rawLines] of sections.entries()) {
        const normalizedTitle = removeDiacritics(title);
        const paragraphs = toParagraphs(rawLines);

        if (
            normalizedTitle.includes('cau chuyen') ||
            normalizedTitle.includes('van hoa')
        ) {
            parsed.culturalStory = paragraphs;
            continue;
        }

        if (normalizedTitle.includes('nguyen lieu')) {
            parsed.ingredients = toListItems(rawLines);
            continue;
        }

        if (normalizedTitle.includes('cach lam')) {
            parsed.steps = toListItems(rawLines);
            continue;
        }

        if (
            normalizedTitle.includes('meo') ||
            normalizedTitle.includes('thuong thuc')
        ) {
            parsed.tips = paragraphs;
            continue;
        }

        parsed.fallbackSections.push({
            title,
            lines: paragraphs.length > 0 ? paragraphs : toListItems(rawLines),
        });
    }

    return parsed;
};

export const parseCommaList = (value?: string): string[] => {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};
