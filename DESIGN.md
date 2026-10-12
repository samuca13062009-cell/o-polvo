---
name: O Polvo
description: The public site of a Portuguese restaurant in Santa Cruz, drawn as the esplanada under its blue-and-white awning.
colors:
  cobalt: "#1648b8"
  cobalt-deep: "#0f3690"
  on-cobalt: "#ffffff"
  on-cobalt-soft: "#d5e0ff"
  sun: "#f0562e"
  sun-text: "#b23a14"
  flag-green: "#1f8a4c"
  flag-yellow: "#f2b705"
  flag-red: "#cf2e1e"
  red-text: "#ad2417"
  canvas: "#f6f7f3"
  sheet: "#ffffff"
  ink: "#0e1b33"
  ink-soft: "#46526a"
  ink-faint: "#667085"
  on-ink-soft: "#c9d1e0"
  rule: "#c5ccd9"
  field-line: "#7d879a"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(5rem, 19vw, 9rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "0"
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 6.2vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "0"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 62"
  subtitle:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    letterSpacing: "0.05em"
    fontVariation: "'wdth' 62"
  label:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 700
    letterSpacing: "0.05em"
    fontVariation: "'wdth' 62"
  lede:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 2.1vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.3
  body:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    letterSpacing: "0"
    fontFeature: "'tnum'"
rounded:
  control: "3px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  pad: "clamp(18px, 5vw, 56px)"
  sec: "clamp(64px, 9vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 1.25em"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.on-cobalt}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 1.25em"
  button-quiet-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
  button-light:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 1.25em"
  button-light-hover:
    backgroundColor: "{colors.on-cobalt-soft}"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.sheet}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0 1.25em"
  button-lg:
    height: "56px"
    padding: "0 1.5em"
  nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    height: "64px"
  tab:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    height: "48px"
    padding: "0 1.05em"
  tab-selected:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
  choice-tile:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  choice-tile-selected:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
  choice-tile-disabled:
    backgroundColor: "transparent"
    textColor: "{colors.ink-faint}"
  step-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "40px"
  step-board:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.on-cobalt}"
    rounded: "{rounded.control}"
    size: "34px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "48px"
    padding: "0.6em 0.8em"
  tray:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
  dock:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    typography: "{typography.label}"
    height: "56px"
---

# Design System: O Polvo

## Overview

**Creative North Star: "O Toldo"**

The page is the esplanada under its awning. A full-width cobalt-and-white striped canvas hangs under the navigation, ends in a scalloped valance and casts the only shadow in the system. Everything below it is flat, sun-bleached and ruled: one sans family, heavy condensed capitals painted like a board outside a beach café, normal-width text for reading, and blue-black rules where another site would draw a box.

Cobalt is committed, not sprinkled. It owns whole regions (the services band, the booking pitch, the map panel) and it marks every chosen thing. A chosen day, time, category or zone does not merely change tint: it takes a cobalt fill with a small striped canopy across its top edge, the awning in miniature. The remaining colours are signals read at a glance outdoors: a green or red flag for open and closed, a yellow square for nearly full, one orange for the sunset.

The system is dense where the visitor is deciding (menu rows, time slots) and generous between sections. It knows the hour: a day line runs from opening to closing with the past greyed, the present under a canopy, a flag planted at now and a half sun sitting on the line at sunset.

This document covers the public site only (`public/index.html`, `public/css/site.css`). The staff panel (`public/admin.html`, `public/css/admin.css`) and the printed menu PDF still carry the previous look and are not described here.

**Key Characteristics:**
- One left axis; every section hangs from the same 1180px column edge.
- Cobalt owns regions and selections; warm and flag colours are state marks only.
- Selection is shown by pattern (the striped canopy), never by tint alone.
- Content is ruled, not boxed: 2px ink rules open blocks, 1px grey lines separate rows.
- One family in two widths: condensed capitals for lettering, normal width for reading.
- Flat everywhere except the awning.

## Colors

A two-colour awning palette (cobalt and white on a bleached off-white ground, written in blue-black ink) with four small signal colours borrowed from beach flags and the setting sun.

### Primary
- **Awning Cobalt** (`cobalt`): the committed colour. The wordmark and hero name, primary buttons, full-bleed regions (services band, booking pitch, map panel), every selected control, the emphasised half of two-part headings, group headings in the menu, focus outlines, text selection and the caret.
- **Cobalt Shade** (`cobalt-deep`): hover state of cobalt surfaces only (primary button, map panel).
- **Canopy White** (`on-cobalt`) and **Pale Stripe** (`on-cobalt-soft`): primary and secondary text on cobalt. Pale Stripe is also the hover fill of the light button.

### Secondary
- **Sunset Orange** (`sun`): the half-sun mark, the sun on the day line, and the outline of the time slot that catches the sunset. Graphic use only.
- **Sunset Text** (`sun-text`): the darker orange used when the sunset is written as words inside a slot.

### Tertiary
- **Flag Green** (`flag-green`): open now, the flag at the current hour, the confirmation tick.
- **Flag Yellow** (`flag-yellow`): the small square beside a slot with few places left.
- **Flag Red** (`flag-red`): closed now, the square beside a full slot, the border of an invalid field.
- **Error Text** (`red-text`): validation messages.

### Neutral
- **Bleached Canvas** (`canvas`): the page ground and the sticky navigation.
- **Sheet White** (`sheet`): the white stripe of the awning, the day line, choice tiles and form fields, and text on ink.
- **Blue-Black Ink** (`ink`): body text, all 2px structural rules, quiet-button outlines, the order tray, the footer and the mobile dock.
- **Soft Ink** (`ink-soft`): secondary text, helper lines, placeholders, counts.
- **Faint Ink** (`ink-faint`): past hours and disabled choices.
- **Soft On-Ink** (`on-ink-soft`): secondary text on ink surfaces (footer copy, tray item list). In the stylesheet this is a repeated literal, not a custom property.
- **Row Line** (`rule`): 1px dividers between rows and the resting outline of choice tiles.
- **Field Line** (`field-line`): the resting 2px outline of text inputs.

### Named Rules
**The Owned Region Rule.** Cobalt fills a whole band, column or control edge to edge. It is never a tinted wash, a thin accent bar on a neutral block, or a gradient into another colour.

**The Flag Rule.** Green, yellow, red and orange only ever report state (open, nearly full, full or invalid, sunset). They appear as small flat shapes beside words that say the same thing; none of them fills a surface or decorates a heading.

**The Two Values Rule.** Orange and red each exist twice: a brighter value for shapes and a darker one for words. Text never uses the shape value.

## Typography

**Display Font:** Archivo variable at 62% width (with Helvetica Neue, Helvetica, Arial, sans-serif)
**Body Font:** Archivo variable at normal width (same file, same fallbacks)

**Character:** One grotesque doing two jobs. Squeezed to its narrowest width, heavy and in capitals, it reads as sign-painter lettering; at normal width and regular weight it is plain, upright reading text. The family is self-hosted as a variable font (weight 100 to 900, width 62% to 125%) in `public/fonts/`.

### Hierarchy
- **Display** (800, clamp(5rem, 19vw, 9rem), line-height 0.92, condensed, uppercase, cobalt): the house name in the hero, on one line. The menu heading uses the same voice at clamp(3.5rem, 10vw, 6rem) in ink.
- **Headline** (800, clamp(2.5rem, 6.2vw, 4.5rem), line-height 0.92, condensed, uppercase): section headings, held to about 17 characters per line and balanced. The second sentence of a heading may turn cobalt.
- **Title** (700, 1.5rem, line-height 1.05, +0.01em, condensed, uppercase): block headings, menu group names, form step questions (1.6rem), the booking summary (1.7rem).
- **Subtitle** (700, 1.05rem, +0.05em, condensed, uppercase): small group headings (meal period over time slots, footer columns).
- **Label** (700, 1.05 to 1.25rem, +0.05 to +0.06em, condensed, uppercase): buttons, navigation links, tabs, language switch, dock, weekday abbreviations.
- **Lede** (500, clamp(1.25rem, 2.1vw, 1.5rem), line-height 1.3, normal width): the single sentence under the house name.
- **Body** (400, 1.0625rem, line-height 1.55, normal width; 1rem below 760px): paragraphs, capped between 34 and 62 characters. Dish names sit at 500, prices at 600.
- **Caption** (500, about 0.8rem, normal width, tabular figures): hours on the day line, counts on tabs, slot notes, helper text (helper text runs up to 0.95rem).

### Named Rules
**The Two Widths Rule.** Condensed width is for capitals that label, name or count: headings, buttons, navigation, tabs, step numbers, large figures. Anything a person reads as a sentence is normal width and sentence case. A small annotation inside a condensed control (a count on a tab, an hour on the day line) drops back to normal width.

**The Board Figures Rule.** Numbers that are compared or that change (prices, hours, quantities, the party size, the booking code) use lining tabular figures. The largest ones (party size, phone number, booking code, day of the month) are set condensed at weight 800 like a painted number board.

**The No Tracking On Display Rule.** Display and headline sizes carry zero letter-spacing. Tracking (+0.01 to +0.06em) belongs to the smaller condensed capitals: titles, labels, the wordmark. The one large tracked figure is the booking code, spaced so it can be read aloud.

## Layout

A single centred column, 1180px at most, with a fluid side gutter (`pad`). Text and controls start on that column's left edge in every section; nothing is centred. Sections are separated by a large fluid interval (`sec`) or by a full-width 2px ink rule. The sticky navigation (64px, 56px on phones) shares the same gutter and closes with a 2px ink rule.

Inside sections the grids are plain and unequal on purpose: two equal columns for heading against points, 5 to 7 for the cobalt booking pitch against the form, three columns (1 : 1 : 1.15) for hours, address and map, five columns for the services list, and a two-column flow for the menu. A cobalt region bleeds to the viewport edge while its content stays on the column.

Spacing between related controls is small and fixed (8px between tiles, 12px between paired buttons, 16px between fields); spacing between blocks is carried by rules with 18 to 30px of padding rather than by empty space alone.

Two breakpoints. At 960px the booking pitch stacks above the form, the map drops to its own row and services go to three columns. At 760px everything becomes one column, navigation links and the header button are replaced by a fixed three-part dock at the bottom (call, menu, book), hero buttons stretch to full width, stepper buttons grow from 40px to 44px, and the order tray sits above the dock. Interactive targets are at least 44px, primary ones 48 to 56px.

## Elevation & Depth

Flat. Surfaces do not float; depth is stated by colour blocks meeting at hard edges and by ink rules. The awning is the one object that hangs in front of the page and is the only thing that casts a shadow. Sticky elements (navigation, order tray, dock) separate from content by a solid fill and a rule, not by a shadow.

### Shadow Vocabulary
- **Awning cast** (`filter: drop-shadow(0 12px 14px rgba(14, 27, 51, .22))`): under the hero awning's scalloped edge only. The small awning that opens the footer has none.

### Named Rules
**The One Shadow Rule.** Only the hero awning casts a shadow. Buttons, tiles, the tray, the navigation and the dock stay flat in every state.

## Shapes

Square and slightly softened. Every control (buttons, tiles, inputs, step numbers, the booking code plate) has the same barely rounded corner (3px). Regions, bands, tabs, the day line and the map panel have square corners.

Curves are reserved for things that are round in the world being drawn: the scallops of the valance, the half sun, and the ring around today's date. The flag is a notched pennant on a 2px pole. State marks are small flat squares (8 to 9px).

Lines come in two weights with fixed jobs: 2px ink for structure (under the navigation, above each block, under the tab row, around quiet buttons and steppers) and 1px for separation (between menu rows, hours rows, day-line segments; white at 38% on cobalt, 22% on ink).

The stripe is the system's pattern. At awning scale it is wide vertical bands with a scalloped lower edge; at control scale it is a 6px strip of 11px cobalt and white bars across the top of a cobalt fill. Stripes are drawn with hard colour stops; there are no blended transitions anywhere.

### Named Rules
**The Canopy Rule.** A chosen or current item takes a solid cobalt fill, white text and the 6px striped strip along its top edge. This applies to tabs, day tiles, time slots, the zone switch, the current segment of the day line and the booking code plate. The strip is never used on anything that is not selected, current or confirmed.

**The Ruled Not Boxed Rule.** Content is not enclosed. Text blocks open with a 2px ink rule and rows are divided by 1px lines. An outline on all four sides means "this can be pressed or typed into" and appears on nothing else. The only filled plates that are not controls are the step boards and the booking code.

## Components

### Buttons
Painted-sign labels: condensed bold capitals, flat fill, no icon.
- **Shape:** softened square (3px), 48px tall, 56px for the large size, 2px transparent border so outlined and filled variants align.
- **Primary:** cobalt fill, white label; hover darkens to Cobalt Shade. The one booking action per region.
- **Quiet:** transparent with a 2px ink outline; hover inverts to ink fill with white label. Secondary actions on light ground.
- **Light / Ghost:** for ink surfaces (the order tray). Light is a white fill with ink label; Ghost is a 55% white outline that brightens and gains a 12% white fill on hover.
- **States:** pressed moves down 1px; disabled drops to 55% opacity. Colour transitions run 0.18s. Focus is a 3px outline offset 2px, cobalt on light ground and white on cobalt or ink.

### Tabs
- **Style:** a row of condensed capital labels sitting on a 2px ink rule, each with a small normal-width count beside it. No outline at rest; hover turns the label cobalt.
- **Selected:** the Canopy Rule.

### Choice tiles (days and time slots)
- **Style:** white tile, 2px Row Line outline, 3px corner. Day tiles are 66 by 92px with weekday, date and month stacked; slots are at least 88 by 58px with the time and an optional note.
- **States:** hover darkens the outline to ink. Selected follows the Canopy Rule. Disabled loses its fill, turns Faint Ink and strikes through its number. Today's date carries a ring.
- **Marks:** yellow square for few places, red square for full, orange outline plus a small half sun for the sunset slot.
- **Segmented switch:** the zone choice is one ink-outlined strip of white cells separated by 2px ink; the chosen cell follows the Canopy Rule.

### Steppers
- **Style:** two 40px square buttons (48px in the booking form, 44px on phones) with a 2px ink outline and a minus or plus drawn from 2px bars; hover inverts to ink. In the form the count between them is a 3.2rem board figure.

### Inputs / Fields
- **Style:** white field, 2px Field Line outline, 3px corner, 48px tall, label above in 0.92rem semibold.
- **Hover / Focus:** outline darkens to ink on hover; on focus it turns cobalt with a 3px cobalt outline.
- **Error:** red outline with a semibold Error Text message under the field.
- **Search:** the menu search has no box, only a 2px ink underline with a magnifier drawn in 2px strokes.

### Navigation
- **Desktop:** sticky bar on the canvas colour closed by a 2px ink rule; cobalt condensed wordmark left, label links centre, language switch and primary button right. The hovered or current link turns cobalt and grows a 5px cobalt bar from the bottom edge. The active language is underlined with a 3px cobalt line.
- **Phone:** links and header button are hidden; a fixed ink dock of three 56px label cells takes over, with the booking cell inverted to white.

### Rows
Menu dishes and opening hours are ruled rows: text left, tabular figure right, 1px line below, at least 58px tall for dishes. A menu group opens with a cobalt title on a 2px ink rule. A dish that is on the visitor's table sets its name bold. Today's row in the hours table is bold with a 9px cobalt square before it.

### Order tray
An ink bar that slides up from the bottom of the menu once a dish is added (0.35s) and stays stuck there: count and item list left, running total and the Ghost and Light buttons right.

### The awning
Full-width cobalt and white vertical stripes, each clamp(34px, 5.2vw, 76px) wide, hanging clamp(84px, 16vh, 150px) and ending in semicircular scallops, with a faint stitched line above the valance. It unrolls once on load (1s, `cubic-bezier(.16, 1, .3, 1)`). A 22px-stripe version with no shadow and no motion opens the footer.

### The day line
A white strip between two 2px ink rules, divided into the day's periods in proportion to their length, each with its start hour above its condensed name. Past periods fall back to canvas and Faint Ink; the current one follows the Canopy Rule. A green pennant on an ink pole stands on the line at the present minute, a half sun sits on the lower rule at sunset, and the closing hour is written at the far right above the line. One sentence under it says the same thing in words.

### Step boards
The five booking questions are numbered with a 34px cobalt square holding a white condensed numeral, set before the question. They are used only where the order is real.

### Motion
State changes take 0.15 to 0.2s. Everything else uses one ease-out curve (`cubic-bezier(.16, 1, .3, 1)`) and only moves `transform`, `opacity`, `clip-path` or a hard-edged background.

- **On load:** the navigation drops in, the awning unrolls, the house name rises letter by letter from its baseline, then the lede, status lines and buttons rise in turn; the day line is swept in from the left, the flag is planted and the sun grows up from the rule.
- **Always:** the hero awning sways in a slow breeze and takes gusts from pointer movement and scrolling (`--vento`, `--sy`, written by `site.js`); the open flag and the day-line pennant ripple. A 3px cobalt line along the navigation rule shows how far down the page the visitor is.
- **On scroll:** headings rise word by word; ruled blocks draw their 2px rule from the left before their text rises; cobalt regions (services band, booking pitch, map) are drawn across from the left like a pulled canvas; the footer awning unrolls.
- **On action:** a chosen tab, day, slot or zone drops its canopy strip into place; menu rows and time slots stagger in when the list changes; a quantity pops, the table total counts to its new value, the party size rolls; primary and quiet buttons fill from the bottom edge on hover; the confirmation tick draws itself and the booking code rises character by character. The language switch cross-fades where view transitions exist.

Hidden starting states depend on `html.motion`, set in the `<head>` only when reduced motion is not requested, or on classes assigned by `site.js`; with reduced motion all animation and transition is removed and nothing starts hidden.

## Do's and Don'ts

### Do:
- **Do** show any selected, current or confirmed item with the Canopy Rule: cobalt fill, white text, 6px striped strip on top.
- **Do** start every block on the shared left edge of the 1180px column and let cobalt regions bleed to the viewport edge.
- **Do** open content blocks with a 2px ink rule and divide rows with 1px lines.
- **Do** set labels, headings and large figures in condensed capitals and everything read as a sentence in normal width.
- **Do** use tabular lining figures for prices, hours and counts.
- **Do** pair every state colour with words that carry the same meaning.
- **Do** switch the focus outline to white on cobalt and ink surfaces.
- **Do** keep controls at 3px corners and at least 44px in their smallest dimension.

### Don't:
- **Don't** put text content in a card, meaning a bordered or tinted box sitting on the ground. Fills are whole regions and four-sided outlines belong to controls.
- **Don't** add shadows to anything except the hero awning.
- **Don't** blend colours; stripes and fills meet at hard edges.
- **Don't** round a control beyond 3px or make capsule-shaped buttons and tags; curves belong to the scallop, the sun and the ring on today's date.
- **Don't** use orange, green, yellow or red for decoration, headings or surface fills.
- **Don't** write words in the shape values of orange or red; use Sunset Text and Error Text.
- **Don't** centre headings or text blocks.
- **Don't** introduce a second typeface, italics, or tracked-out display sizes.
- **Don't** use the striped strip as ornament on unselected elements.
- **Don't** present stock or generated pictures as the restaurant; photograph places stay empty until real photographs exist.
