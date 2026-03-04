import re

with open('.gemini/antigravity/brain/05f58e85-07e2-4f1b-aa8e-8ebca0c909f2/.system_generated/steps/9/output.txt', 'r') as f:
    lines = f.readlines()

# find export default function
start_idx = 0
for i, line in enumerate(lines):
    if line.split(': ', 1)[-1].startswith('export default function'):
        start_idx = i
        break

end_idx = 0
for i in range(start_idx, len(lines)):
    if '});' in lines[i] or '}' == lines[i].split(': ', 1)[-1].strip():
        end_idx = i

react_code = ""
for line in lines[start_idx:end_idx+1]:
    # Strip line numbers
    clean_line = line.split(': ', 1)[-1]
    react_code += clean_line

# Remove export default function wrappers
react_code = re.sub(r'export default function CtaSection\(\) \{\s*return \(', '', react_code)
react_code = re.sub(r'\);\s*\}\s*$', '', react_code)

# Replace className -> class
react_code = react_code.replace('className=', 'class=')
# Replace imgRectangle variables with string paths
react_code = react_code.replace('{imgRectangle17}', '"/images/cta/rect17.svg"')
react_code = react_code.replace('{imgRectangle18}', '"/images/cta/rect18.svg"')
react_code = react_code.replace('{imgRectangle19}', '"/images/cta/rect19.svg"')
react_code = react_code.replace('{imgRectangle20}', '"/images/cta/rect20.svg"')

# Remove data-nodes
react_code = re.sub(r'\sdata-node-id="[^"]+"', '', react_code)
react_code = re.sub(r'\sdata-name="[^"]+"', '', react_code)

# Fix custom style prop string
react_code = react_code.replace('style={{ "--transform-inner-width": "1200", "--transform-inner-height": "2456" } as React.CSSProperties}', 'style="--transform-inner-width: 1200; --transform-inner-height: 2456;"')

astro_template = """---
import type { CtaData } from "../lib/grav";

interface Props {
  data: CtaData;
}

const { data } = Astro.props;
if (!data) return null;

// Fallbacks are handled in the template if data fields are missing.
---

<section class="cta-section bg-[var(--color-bg-cta-section)] w-full relative overflow-hidden py-20 px-6 md:px-16 lg:px-[113px] flex items-center justify-center">
  <div class="max-w-[1440px] w-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-[80px] relative z-10 items-center">
    
    <!-- Content Area -->
    <div class="content flex flex-col gap-6 lg:gap-8 items-start justify-self-stretch relative z-20">
      <div class="flex flex-col gap-4 relative w-full">
        <!-- Headline -->
        <h2 class="font-display font-bold leading-[1.1] text-[36px] md:text-[44px] text-white tracking-[1px] uppercase w-full whitespace-pre-wrap">
          {data.headline || "Welche Module benötigst du?"}
        </h2>
        
        <!-- Copy -->
        <p class="font-body font-medium leading-[1.5] text-[16px] md:text-[18px] text-[var(--color-text-secondary)] tracking-[0.5px] w-full max-w-2xl whitespace-pre-wrap">
          {data.copy || "Reibungslose Implementierung mit Personalmanagement..."}
        </p>
      </div>
      
      <!-- CTA Button -->
      {data.button_text && (
        <a 
          href={data.button_link || "#Kontakt"}
          class="bg-[var(--color-btn-secondary-bg)] hover:bg-white transition-colors duration-300 flex items-center justify-center px-6 py-4 rounded-xl shrink-0"
        >
          <span class="font-action font-medium leading-[1.2] text-[var(--color-btn-secondary-text)] text-[18px] text-center tracking-[0.5px]">
            {data.button_text}
          </span>
        </a>
      )}
    </div>

    <!-- 3D Bricks Illustration Graphic wrapper -->
    <div class="hidden lg:block relative z-0 opacity-80 pointer-events-none scale-75 xl:scale-100 transform origin-right">
      <div class="relative w-[300px] h-[300px]">
        <!-- Extract the crazy brick structure but simplify its container so it fits -->
        <div class="absolute right-0 top-1/2 -translate-y-1/2 scale-[0.6] origin-right">
            [REPLACE_ME_BRICKS]
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .cta-section {
    background-color: var(--color-bg-cta-section);
  }
</style>
"""

# Extract ONLY the col-3 brick container
import bs4
soup = bs4.BeautifulSoup(react_code, "html.parser")
col3 = soup.find("div", class_=lambda x: x and "col-3" in x)
if col3:
    # strip positioning from col-3 itself so we can manage it in the wrapper
    col3['class'] = "relative w-[800px] h-[600px] block"
    # Wait, looking at the inline styles, they have margins like ml-[1034px] dtc. This is relative to a huge canvas.
    # Let's just adjust the left margins slightly by subtracting 900px so it fits nicely.
    html_bricks = str(col3)
    def adjust_ml(match):
        val = float(match.group(1))
        # Keep it somewhat responsive by reducing the massive left offset
        new_val = max(0, val - 950)
        return f"ml-[{new_val}px]"
    
    html_bricks = re.sub(r'ml-\[([0-9.]+)px\]', adjust_ml, html_bricks)
    
    final_code = astro_template.replace('[REPLACE_ME_BRICKS]', html_bricks + "\n<!-- To fix missing text/primiary-inverse -->\n<style>\n.bg-\\[var\\(--text\\\\\\/primiary-inverse\\,\\#f4f4f4\\)\\] {\n  background-color: var(--color-background-primary-inverse);\n}\n</style>")
else:
    final_code = astro_template.replace('[REPLACE_ME_BRICKS]', '<!-- BRICKS FAILED TO PARSE -->')


# Replace string literals for React `{...}`
final_code = final_code.replace("`Reibungslose Implementierung mit Personalmanagement, Digitalisierung & Innovation sind sind bei uns immer gegeben. Das Verpflegungsangebot sollte noch auf das Unternehmen zugeschnitten werden.`", '""')

with open('frontend/src/components/CtaSection.astro', 'w') as f:
    f.write(final_code)

print("success")
