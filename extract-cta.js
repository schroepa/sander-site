import fs from 'fs';
import path from 'path';

const inputFile = '/Users/ptrck/.gemini/antigravity/brain/05f58e85-07e2-4f1b-aa8e-8ebca0c909f2/.system_generated/steps/9/output.txt';
const outputFile = '/Users/ptrck/Documents/Sander-Catering Onepager/sander-site/frontend/src/components/CtaSection.astro';

try {
    const content = fs.readFileSync(inputFile, 'utf-8');
    
    // Extract the col-3 brick container
    let startIdx = content.indexOf('<div className="col-3');
    let endIdx = content.lastIndexOf('</div>\n    </div>\n  );\n}'); // This is tricky, it's better to balance tags.
    
    // Let's just use simple tag balancing
    let balance = 0;
    let extracted = '';
    for (let i = startIdx; i < content.length; i++) {
        const char = content[i];
        extracted += char;
        if (content.substr(i, 4) === '<div') balance++;
        else if (content.substr(i, 5) === '</div') balance--;
        
        if (balance === 0) {
            break;
        }
    }

    if (startIdx === -1 || extracted.length < 100) {
        console.error("Failed to extract col-3");
        process.exit(1);
    }

    let astroCode = extracted;
    
    // Replace React specific syntax with HTML/Astro syntax
    astroCode = astroCode.replace(/className=/g, 'class=');
    astroCode = astroCode.replace(/\{imgRectangle17\}/g, '"/images/cta/rect17.svg"');
    astroCode = astroCode.replace(/\{imgRectangle18\}/g, '"/images/cta/rect18.svg"');
    astroCode = astroCode.replace(/\{imgRectangle19\}/g, '"/images/cta/rect19.svg"');
    astroCode = astroCode.replace(/\{imgRectangle20\}/g, '"/images/cta/rect20.svg"');
    
    // Remove data attributes to clean up the code
    astroCode = astroCode.replace(/\sdata-node-id="[^"]+"/g, '');
    astroCode = astroCode.replace(/\sdata-name="[^"]+"/g, '');
    
    // Fix custom style injected by Figma
    astroCode = astroCode.replace(
        /style=\{{ "--transform-inner-width": "1200", "--transform-inner-height": "2456" } as React\.CSSProperties\}/g,
        'style="--transform-inner-width: 1200; --transform-inner-height: 2456;"'
    );
    
    // Fix massive negative padding/margin on the main container so it fits in our scalable wrapper better.
    // Replace 'ml-[1034px]' with 'ml-0', etc.
    astroCode = astroCode.replace(/ml-\[1034px\]/g, 'ml-[134px]');
    astroCode = astroCode.replace(/ml-\[1209px\]/g, 'ml-[309px]');
    astroCode = astroCode.replace(/ml-\[975\.67px\]/g, 'ml-[75.67px]');
    astroCode = astroCode.replace(/ml-\[1092\.33px\]/g, 'ml-[192.33px]');

    const finalAstro = `---
import type { CtaData } from "../lib/grav";

interface Props {
  data: CtaData;
}

const { data } = Astro.props;
if (!data) return null;
---

<section class="w-full relative overflow-hidden py-16 md:py-20 lg:py-24 px-6 md:px-16 lg:px-[113px] flex items-center justify-center bg-[var(--color-bg-cta-section)]">
  <div class="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-16 relative z-10 items-center">
    
    <!-- Content Area -->
    <div class="content flex flex-col gap-6 lg:gap-8 items-start relative z-20">
      <div class="flex flex-col gap-2 relative w-full">
        <h2 class="font-display font-bold leading-[1.1] text-[32px] md:text-[40px] lg:text-[44px] text-white tracking-[1px] uppercase w-full">
          {data.headline || "Welche Module benötigst du?"}
        </h2>
        
        <p class="font-body font-medium leading-[1.5] text-[16px] md:text-[18px] text-[var(--color-text-secondary)] tracking-[0.5px] w-full max-w-xl">
          {data.copy || "Reibungslose Implementierung mit Personalmanagement, Digitalisierung & Innovation sind bei uns immer gegeben. Das Verpflegungsangebot sollte noch auf das Unternehmen zugeschnitten werden."}
        </p>
      </div>
      
      {data.button_text && (
        <a 
          href={data.button_link || "#kontakt"}
          class="bg-[var(--color-components-button-secondary-background-default)] hover:bg-[var(--color-components-button-secondary-background-hover)] transition-colors duration-300 flex items-center justify-center px-6 py-4 rounded-xl shrink-0"
        >
          <span class="font-action font-medium leading-[1.2] text-[var(--color-components-button-primary-text-default)] text-[18px] text-center tracking-[0.5px]">
            {data.button_text}
          </span>
        </a>
      )}
    </div>

    <!-- 3D Bricks Illustration Graphic wrapper -->
    <div class="hidden lg:flex relative z-0 items-center justify-center w-full min-h-[400px]">
      <div class="relative w-full h-full scale-[0.5] xl:scale-[0.85] origin-center -translate-y-24">
        ${astroCode}
      </div>
    </div>
  </div>
</section>

<style>
  /* Patching dynamic variables exported by figma */
  .bg-\\[var\\(--text\\\\\\/primiary-inverse\\,\\#f4f4f4\\)\\] {
    background-color: var(--color-background-primary-inverse);
  }
</style>
`;

    fs.writeFileSync(outputFile, finalAstro);
    console.log("Successfully created CtaSection.astro");
} catch (e) {
    console.error(e);
    process.exit(1);
}
