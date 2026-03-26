# Sander Catering — Admin Design System

> Alle zukünftigen Anpassungen am Grav-Admin-Backend **müssen** sich
> an diese Regeln halten. Ziel: konsistentes, wartbares UI.

---

## Grundprinzipien

| Eigenschaft | Wert |
|---|---|
| **Preset-Vorlage** | shadcn/ui · Nova · Taupe |
| **Schrift** | Geist (selbst gehostet via `/fonts/`) |
| **Radius-Skala** | Nova-Style — leicht abgerundet |
| **Farbsystem** | CSS Custom Properties (`:root` in `custom-admin.css`) |
| **Sidebar** | Dark — Brand Aubergine |
| **Content-Area** | Light — Warmes Taupe-Weiß |

---

## Farb-Tokens

### Brand (Aubergine-Palette — aus `tokens.css` des Frontends)

```css
--ab-900  hsl(322, 17%, 14%)   /* Tiefes Aubergine — z.B. Logo-Bereich */
--ab-800  hsl(322, 17%, 22%)   /* Sidebar BG · Primary Buttons          */
--ab-700  hsl(321, 15%, 28%)   /* Sidebar Hover                         */
--ab-600  hsl(321, 15%, 31%)   /* Sidebar Aktives Item                  */
--ab-500  hsl(319, 12%, 41%)   /* Border auf dunklem Hintergrund        */
--ab-400  hsl(319, 12%, 51%)   /* Fokusring · Accent · Nav-Badges       */
--ab-300  hsl(321, 18%, 65%)   /* Sidebar Muted Text                    */
--ab-200  hsl(321, 18%, 75%)   /* Sidebar Light Text                    */
--ab-100  hsl(321, 18%, 85%)   /* Sidebar Aktiver Link-Text             */
--ab-050  hsl(320, 10%, 94%)   /* Sidebar Text Primary                  */
```

> **Regel:** Niemals Orangetöne, Blautöne oder andere fremde Farben
> für primäre Aktionen verwenden. Die Akzentfarbe ist immer aus
> der Aubergine-Palette (`--ab-400` bis `--ab-800`).

### Content-Area (Warm Taupe — shadcn Nova/Taupe Preset)

```css
--c-bg          #ffffff      /* Karten, Inputs, Hintergrund */
--c-bg-muted    #fafaf9      /* Seiteninhalt-Hintergrund    */
--c-bg-subtle   #f5f2ef      /* Gedrückte Zustände, Hover   */
--c-fg          #1c1714      /* Primärer Text (Warm Black)  */
--c-fg-mid      #6b5e57      /* Sekundärer Text             */
--c-fg-muted    #9d8f89      /* Tertiärer Text, Platzhalter */
--c-border      #e8e2dd      /* Rahmen (warm taupe)         */
--c-border-hover #d4cdc7     /* Rahmen beim Hover           */
```

> **Regel:** Alle Hintergründe und Textfarben in der Content-Area
> ausschließlich über diese Tokens. Keine Hardcode-Hex-Werte.

### Fehler / Gefahr

```
Danger-Rot: #dc4f4f  (Hover: #b91c1c)
```

---

## Typografie

```
Font:        Geist (Regular 400, Medium 500, Bold 700)
Fallback:    system-ui, -apple-system, sans-serif
Smoothing:   antialiased
```

| Verwendung | Größe | Gewicht |
|---|---|---|
| Seitentitel (h1 im Titlebar) | 1rem | 600 |
| Label | 0.8125rem (13px) | 500 |
| Sublabel / Hilfetext | 0.75rem (12px) | 400 |
| Input / Textarea | 0.875rem (14px) | 400 |
| Button | 0.875rem (14px) | 500 |
| Nav-Item | 0.875rem (14px) | 500 |
| Nav-Item aktiv | 0.875rem (14px) | **600** |
| Badge / Tag | 0.65–0.75rem | 500–600 |

---

## Border-Radius-Skala

```css
--r-sm   0.375rem   /*  6px — Inputs, Buttons, kleine Badges */
--r-md   0.5rem     /*  8px — Karten, Listen-Items, Toggles  */
--r-lg   0.75rem    /* 12px — Admin-Blocks (Haupt-Karten)     */
```

> **Regel:** Nie größere Radien als `--r-lg` verwenden.
> Pill-Shapes (999px) nur für Notification-Badges im Sidebar-Nav.

---

## Schatten-Skala

```css
--s-xs    0 1px 2px rgba(28,23,20,.05)                            /* Inputs, kleine Elemente */
--s-sm    0 1px 3px rgba(28,23,20,.10), 0 1px 2px -1px ...(.06)  /* Karten, Dropdowns       */
--s-md    0 4px 6px -1px rgba(28,23,20,.10), ...                  /* Hover, Modals           */
--s-hover 0 3px 8px -1px rgba(28,23,20,.12)                       /* List-Item auf Hover     */
```

---

## Sidebar

```
Hintergrund:    --ab-800  hsl(322, 17%, 22%)
Hover:          --ab-700  hsl(321, 15%, 28%)
Aktiv:          --ab-600  hsl(321, 15%, 31%)
Logo-Bereich:   --ab-900  hsl(322, 17%, 14%)  [noch dunkler]
Border:         --ab-500  hsl(319, 12%, 41%)
Text primary:   --ab-050  hsl(320, 10%, 94%)
Text muted:     --ab-200  hsl(321, 18%, 75%)
Fokusring:      --ab-400  hsl(319, 12%, 51%)
Breite offen:   220px
Breite zu:      56px (nur Icons)
```

---

## Formular-Regeln

1. **Label immer über dem Input** (vertikal, kein Side-by-Side)
2. **Abstand Label→Input**: `gap: 0.3rem`
3. **Abstand zwischen Feldern**: `margin-bottom: 1.25rem`
4. **Trennlinie**: `1px solid var(--c-bg-subtle)` unter jedem Feld (nicht beim letzten)
5. **Spalten** (type: columns): Flexbox mit `gap: 1.25rem`, halbe Breite minus halber Gap

---

## Interaktionszustände

| Zustand | Farbe / Style |
|---|---|
| Focus (Input) | `border-color: --ab-400` + `box-shadow: 0 0 0 2px hsla(319,12%,51%,0.2)` |
| Focus (Trumbowyg) | Gleich wie Input-Focus |
| Button Hover (Primary) | `--ab-700` |
| Button Hover (Secondary) | `--c-bg-subtle` |
| List-Item Hover | `--s-hover` + `--c-border-hover` |
| Tab aktiv | `border-bottom: 2px solid --ab-800` |
| Toggle aktiv | `background: --c-bg` + `--s-sm` |

---

## Toggle-Buttons (An/Aus, Normal/Expert)

Das HTML von Grav für `type: toggles`:
```html
<div class="switch-toggle switch-grav">
  <input type="radio" id="f_0" name="f" value="0" checked>
  <label for="f_0">Aus</label>
  <input type="radio" id="f_1" name="f" value="1">
  <label for="f_1">An</label>
  <a></a>
</div>
```
- Radio-Inputs sind `opacity:0; width:0; height:0`
- Labels erscheinen als segmentierter Toggle
- `<a>` ist versteckt (Grav-Default-Slider, nicht nötig)
- Aktiver Label: `--c-bg` + Box-Shadow

---

## Änderungen vornehmen

### Neue Farbe hinzufügen
→ Nur in der `:root`-Sektion von `custom-admin.css` ergänzen.
Niemals direkte Hex/RGB-Werte im Rest der Datei.

### Neue Komponente stylen
1. Abschnittsnummer fortführen (aktuell: 21 Abschnitte)
2. Selektoren mit `!important` (Grav default CSS hat hohe Spezifität)
3. Variablen aus `:root` verwenden
4. Im entsprechenden Abschnitt dieser Dokumentation ergänzen

### Spezifische Kollektionen
Layouts für bestimmte Daten-Collections werden über
`[data-collection-holder="header.X.items"]` angesprochen.
Bestehende Beispiele in Abschnitt 14 der CSS-Datei.

---

## Datei-Referenz

| Datei | Zweck |
|---|---|
| `cms/user/data/admin/custom-admin.css` | **Diese Datei** — Das komplette Admin-Styling |
| `cms/user/config/plugins/admin.yaml` | Lädt die CSS-Datei via `whitelabel.custom_css` |
| `frontend/src/styles/tokens.css` | Frontend Design Tokens (Quelle der Brand-Farben) |
| `frontend/src/styles/global.css` | Frontend Base Styles |

Die Admin-CSS wird geladen über:
```yaml
# cms/user/config/plugins/admin.yaml
whitelabel:
  custom_css: '@import url("/user/data/admin/custom-admin.css");'
```
