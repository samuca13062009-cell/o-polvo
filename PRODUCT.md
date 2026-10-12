# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People deciding where to eat in Santa Cruz (Torres Vedras): locals, Portuguese weekend and summer visitors, and foreign tourists who read English. Most arrive on a phone, often the same day, wanting three things fast: what is on the menu and what it costs, whether the house is open, and a table. Restaurant staff use a separate admin panel (`admin.html`).

## Product Purpose

The public site of O Polvo, a Portuguese restaurant in Santa Cruz. It shows the menu with prices, the opening hours and location, and takes table requests online that the restaurant then confirms. Success is a visitor who books or calls, or who walks in knowing what to expect.

## Positioning

A family-style Portuguese house facing the Atlantic, open every day from breakfast until late at night, with octopus as the house speciality. The site knows the day: whether the house is open right now, when the sun sets in Santa Cruz today, and which table time catches it.

## Operating Context

- Source lives in `public/` (`index.html`, `css/site.css`, `js/*.js`), served by a dependency-free Node server (`server.js`).
- `node build-single.js` bundles the site into one file, `../o-polvo.html`, which runs without a server and stores bookings in the browser (demo mode).
- A printed A4 menu exists (`../menu-o-polvo.html`, `public/menu-o-polvo.pdf`) and is linked from the site.

## Capabilities and Constraints

- Bilingual, Portuguese and English, switched in place through `data-en` attributes and `L(pt, en)` in `js/site.js`.
- Menu with category tabs and search; visitors can add dishes to a "table", see a running total, and carry the selection into the booking notes.
- Booking widget: party size, 14-day strip plus free date, time slots with live availability, zone preference (dining room or terrace), contact details, confirmation with code and calendar file.
- Live status: open or closed now, today's sunset time, the day's rhythm bar, and a sunset slot suggestion.
- Map loads only on request, because it sends the visitor's IP to Google.
- All facts are fixed: dish names and prices, hours, address, phone, e-mail, NIF, payment methods, services, the complaints-book link and the staff-area link.
- Element ids and data hooks used by `js/site.js`, `js/store.js` and `js/shared.js` must keep working; booking rules are shared with the server and the admin panel.

## Brand Commitments

- Name: O Polvo. Octopus is the house speciality.
- No animated octopus mascot on the public site (owner decision, October 2026).
- Voice: plain, warm, second person formal Portuguese ("a sua mesa"); British English.

## Evidence on Hand

- Real menu and prices, hours, address, contacts, services and payment methods (in `public/js/data.js` and `public/index.html`).
- No photographs of the restaurant, the food or the view exist yet. Do not use stock or generated imagery presented as the restaurant; leave clearly marked places for real photos.
- No reviews, awards, press or founding date are on hand. Do not invent them.

## Product Principles

1. Menu, hours and a table are never more than one tap away.
2. Say only what is true of this house; no borrowed prestige.
3. The site should read as the restaurant speaking, not as a web demo.
4. A phone in one hand, outdoors, in daylight, is the main case.

## Accessibility & Inclusion

Keyboard-operable booking flow, visible focus, readable contrast in bright light, reduced-motion respected, and full parity between the Portuguese and English versions.
