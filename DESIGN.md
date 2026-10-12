---
name: O Polvo
description: The public site of a Portuguese restaurant in Santa Cruz, presented like a modern product page - dark, typographic and in constant quiet motion.
colors:
  dark-bg: "#10151b"
  dark-surface: "#171d25"
  dark-surface-2: "#1f2731"
  dark-text: "#e9ecef"
  dark-text-2: "#aab4bf"
  dark-text-3: "#8793a0"
  dark-accent: "#45b5d8"
  light-bg: "#f3f4f6"
  light-surface: "#ffffff"
  light-surface-2: "#eceef1"
  light-text: "#1d242c"
  light-text-2: "#4a5866"
  light-accent: "#13708f"
  button: "#147a9b"
  sun: "#ff8a4c"
  ok: "#4fd08b"
  bad: "#ff7a66"
typography:
  family: "Archivo, Helvetica Neue, Helvetica, Arial, sans-serif"
  display: "800, clamp(2.5rem, 4.3vw, 3.9rem), line-height 1.02, letter-spacing -0.045em"
  headline: "800, clamp(2rem, 3.9vw, 3.3rem), line-height 1.06, letter-spacing -0.035em"
  kicker: "600, 0.78rem, uppercase, letter-spacing 0.18em"
  body: "400, 1.0625rem, line-height 1.6"
rounded:
  card: "22px"
  control: "14px to 16px"
  pill: "999px"
---

# Design System: O Polvo

## Overview

The reference for this direction is digitalconvert.pt (owner's choice, October 2026): a dark page with tight, heavy headlines, pill buttons, rounded bordered cards, numbered kickers and restrained but continuous motion. O Polvo adapts that language to a restaurant with no photographs on hand: where the reference shows device mock-ups and pictures, this site shows live facts - today's sun over Santa Cruz, the day's rhythm, dishes with their prices.

This document covers the public site only (`public/index.html`, `public/css/site.css`, `public/js/site.js`). The staff panel and the printed menu PDF keep their earlier look.

## Themes

Sections alternate. `.dark` (hero, the house, bookings, closing, footer) and `.light` (menu, visit) each set the same custom properties (`--bg`, `--sf`, `--sf2`, `--ln`, `--ln2`, `--tx`, `--tx2`, `--tx3`, `--ac`, `--btn`, `--glow`); components read only those. Light sections are large rounded panels sitting on the dark page.

- **Accent** is a sea blue-teal: `--ac` for text and marks, `--btn` for filled buttons and every selected control.
- **Sun orange** is only for the sun: the arc in the hero panel, the sunset icon and the time slot that catches the sunset.
- **Green and red** only report open and closed, success and error, always beside words that say the same.

## Typography

One family, Archivo variable, self-hosted. Headlines are weight 800 at normal width with strong negative tracking; the second sentence of a heading turns accent. Kickers are small tracked capitals, numbered `01` to `04` on the main sections. Reading text is regular weight in the secondary text colour. Prices, hours and counts use tabular figures.

## Components

- **Buttons:** pills, 52px (44px small). Primary is filled with a soft coloured shadow and lifts 2px on hover while its arrow moves up and right; ghost is a 1px outline.
- **Cards:** 1px line, 22px radius, surface fill. `.spot` cards lift on hover and show a soft light that follows the pointer.
- **Header:** fixed and transparent; after 24px of scroll it shrinks and takes a blurred dark fill. A 2px accent line along its bottom shows scroll progress. Under 900px the links collapse into a round burger that opens a full-screen menu.
- **Hero panel:** "Hoje no Polvo" - the sun's arc from sunrise to sunset with the sun at the current time, the day's periods with the current one filled, and one sentence. A smaller glass card overlaps it and cycles through three dishes per category.
- **Menu:** pill tabs with a sliding indicator, rows on a white card with round plus and minus buttons, and a dark floating tray for the running total.
- **Booking form:** a dark card; days, slots and the zone switch are rounded tiles that fill with the button colour when chosen.
- **FAQ:** rows that open with a height animation; the plus turns into a minus.

## Motion

One curve, `cubic-bezier(.22, 1, .36, 1)`. Only `transform`, `opacity`, `clip-path` and `stroke-dashoffset` move.

- **On load:** header drops in; the headline rises line by line from a mask; kicker, lead, buttons and status follow in a stagger; the panel and the dish card rise and settle; the sun travels the arc to the current time.
- **Always:** the unfinished part of the arc is a moving dashed line; the open dot pulses; the dish card's active tab fills like a timer and advances (paused on hover); the services strip scrolls and pauses on hover; the sunset icon's rays turn slowly; rings pulse out from the map pin.
- **Pointer and scroll:** in the hero the panel tilts a few degrees, the dish card and background light drift, and the diagonal beams slide as the page scrolls.
- **On scroll:** blocks fade up 34px in a stagger; headings rise word by word; light sections widen from a rounded inset to full width; numbers count up.
- **On action:** the tab indicator slides; menu rows and time slots cascade in when the list changes; a chosen tile settles with a small scale; quantities pop, the total counts to its new value, the party size rolls; the confirmation tick draws itself and the code rises character by character; the language switch cross-fades.

Hidden starting states depend on `html.motion`, set in the `<head>` only when reduced motion is not requested, or on classes assigned by `site.js`. With reduced motion everything is static and nothing starts hidden.

## Don'ts

- Don't use stock or generated pictures as the restaurant; the photo place in "A casa" stays commented out until real photographs exist.
- Don't invent facts, reviews or numbers; every figure on the page comes from `data.js` or the fixed facts in `PRODUCT.md`.
- Don't use orange for anything but the sun, or the accent as a large background fill.
- Don't add a second typeface.
