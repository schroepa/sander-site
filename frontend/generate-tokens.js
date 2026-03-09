import fs from 'fs';
import path from 'path';

const tokensPath = path.resolve('src/styles/tokens.json');
const cssPath = path.resolve('src/styles/tokens.css');

const tokensData = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Format HSL string: hsl(315, 4, 96) -> hsl(315, 4%, 96%)
function formatColor(colorStr) {
  if (colorStr.startsWith('hsl(')) {
    const match = colorStr.match(/hsl\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    if (match) {
      return `hsl(${match[1]}, ${match[2]}%, ${match[3]}%)`;
    }
  } else if (colorStr.startsWith('hsla(')) {
    const match = colorStr.match(/hsla\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
    if (match) {
      return `hsla(${match[1]}, ${match[2]}%, ${match[3]}%, ${match[4]})`;
    }
  }
  return colorStr; // fallback
}

const darkSemantic = tokensData['01ColorSemantic']['dark'];

// We map exact old css variable names to the new semantic keys from tokens.json
const colorMappings = {
  '--color-bg-app': 'backgroundAppBackground',
  '--color-bg-primary': 'backgroundPrimary',
  '--color-bg-secondary': 'backgroundSecondary',
  '--color-bg-card': 'backgroundCardBackground',
  '--color-bg-overlay': 'backgroundOverlay',
  '--color-bg-cta-section': 'backgroundCtaSection',
  '--color-bg-elevation-glass': 'backgroundElevationGlass2', // or 1?
  '--color-bg-primary-inverse': 'backgroundPrimaryInverse',
  
  '--color-text-primary': 'textPrimary',
  '--color-text-secondary': 'textSecondary',
  '--color-text-tertiary': 'textTertiary',
  // Note: JSON has a typo "textPrimiaryInverse"
  '--color-text-primary-inverse': 'textPrimiaryInverse',

  '--color-stroke-primary': 'strokePrimary',
  '--color-stroke-tertiary': 'strokeTertiary',
  '--color-stroke-brand-medium': 'strokeBrandMedium',
  '--color-stroke-danger': 'strokeStateDangerSubtle',
  '--color-stroke-success': 'strokeStateSuccessBold',

  '--color-icon-primary': 'iconPrimary',
  '--color-icon-success': 'iconStateSuccessSubtle',

  '--color-state-success': 'backgroundStateSuccessSubtle',

  '--color-btn-primary-bg': 'componentsButtonPrimaryBackgroundDefault',
  '--color-btn-primary-text': 'componentsButtonPrimaryTextDefault',
  '--color-btn-secondary-bg': 'componentsButtonSecondaryBackgroundDefault',
  '--color-btn-secondary-text': 'componentsButtonSecondaryTextDefault',
  '--color-input-bg': 'componentsInputBackgroundDefault',
  '--color-input-text': 'componentsInputTextDefault',
  '--color-input-icon': 'componentsInputIconDefault',
  
  '--color-fade-default': 'componentsFadeDefault',
  '--color-fade-invisible': 'componentsFadeInvisible'
};

let cssContent = `/**
 * ─── Design System Tokens ───
 * Extracted from Figma variables via MCP Server.
 * Font family: Geist
 *
 * This file sets the system to ALWAYS be dark mode per user request.
 * Using CSS variables (no hardcoded values).
 */

@theme {
  /* ─── Semantic Colors (Mapped for existing codebase) ─── */
`;

for (const [cssVar, jsonKey] of Object.entries(colorMappings)) {
  const value = darkSemantic[jsonKey];
  if (value) {
    cssContent += `  ${cssVar}: ${formatColor(value)};\n`;
  } else {
    console.warn(`Warning: missing token ${jsonKey} for ${cssVar}`);
  }
}

// Add all the semantic variables directly
cssContent += `\n  /* ─── Semantic Colors (All directly from tokens.json) ─── */\n`;
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
for (const [key, value] of Object.entries(darkSemantic)) {
  const cssVarName = `--color-${toKebabCase(key)}`;
  const cssValue = formatColor(value);
  cssContent += `  ${cssVarName}: ${cssValue};\n`;
}

cssContent += `
  /* ─── Typography ─── */
  --font-display: 'Geist', system-ui, -apple-system, sans-serif;
  --font-heading: 'Geist', system-ui, -apple-system, sans-serif;
  --font-body: 'Geist', system-ui, -apple-system, sans-serif;
  --font-action: 'Geist', system-ui, -apple-system, sans-serif;
  --font-caption: 'Geist', system-ui, -apple-system, sans-serif;

  /* Font Size */
  --text-display-sm: 44px;
  --text-h1: 38px;
  --text-h2: 30px;
  --text-h3: 24px;
  --text-h4: 20px;
  --text-h5: 16px;
  --text-body-lg: 18px;
  --text-body-md: 16px;
  --text-body-sm: 14px;
  --text-action-lg: 18px;
  --text-action-sm: 12px;
  --text-overline-lg: 12px;

  /* Line Height */
  --leading-display-sm: 48px;
  --leading-h1: 58px;
  --leading-h2: 41px;
  --leading-h3: 29px;
  --leading-h4: 24px;
  --leading-h5: 24px;
  --leading-body-lg: 27px;
  --leading-body-md: 24px;
  --leading-body-sm: 21px;
  --leading-action-lg: 24px;
  --leading-action-sm: 16px;
  --leading-overline-lg: 14.5px;

  /* Font Weight */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-bold: 700;
  --weight-extra-bold: 800;
  --weight-black: 900;

  /* ─── Spacing ─── */
  --space-0: 0px;
  --space-050: 4px;
  --space-100: 8px;
  --space-150: 12px;
  --space-200: 16px;
  --space-300: 24px;
  --space-500: 40px;
  --space-800: 64px;
  --space-1000: 80px;

  /* ─── Border Radius ─── */
  --radius-0: 0px;
  --radius-100: 8px;
  --radius-150: 12px;
  --radius-200: 16px;
  --radius-300: 24px;
  --radius-rounded: 1000px;

  /* ─── Border Width ─── */
  --border-m: 2px;
  --border-l: 3px;
  --border-xl: 4px;

  /* ─── Blur ─── */
  --blur-xl: 72px;

  /* ─── Shadows ─── */
  --shadow-m:
      0px 2px 4px -1px #251c210f,
      0px 4px 6px -1px #251c2114;
  --shadow-xxl:
      0px 6px 16px -2px #251c210a,
      0px 24px 40px -4px #251c2114;
}

:root {
  color-scheme: dark;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Successfully generated tokens.css with Tailwind v4 @theme!');
