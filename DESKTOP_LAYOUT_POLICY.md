# Fitted desktop-canvas layout policy

The Music Literacy Hub uses a fixed **1280px desktop layout** for every page
except the public homepage, `index.html`.

The fixed-canvas rule applies to every activity, Digital Past Paper and
internal project tool. On screens narrower than 1280px, the whole desktop
canvas is proportionally fitted into the visible width without changing its
layout. `index.html` is deliberately responsive and mobile-friendly.

## Permanent rules

- Every HTML page except `index.html` must use
  `width=1280` in its viewport tag. Do not force `initial-scale=1.0`; mobile
  browsers must infer the scale that fits the complete canvas.
- Every HTML page except `index.html` must load `desktop-layout.css`.
- Pages that use Tailwind must load `desktop-layout.js` immediately after the
  Tailwind browser script.
- Do not add viewport-width media queries.
- Do not add mobile or tablet layouts.
- Do not use page-specific JavaScript to select a layout from the viewport
  width, orientation or device type.
- Do not shrink or rearrange navigation, cards, forms, tables, notation,
  controls, spacing or typography to fit a smaller screen.
- Keep desktop dimensions, fit the whole canvas proportionally on narrower
  screens, prevent horizontal page scrolling and retain vertical scrolling.
- Input-specific behaviour, such as keyboard focus and pointer handling, may
  support touch devices only when it does not change the layout.

## Homepage exception

- `index.html` must use `width=device-width, initial-scale=1.0`.
- Its established responsive header, cards, filters, footer and modal behaviour
  must be preserved.
- Do not extend this exception to any other page.

Run `pnpm test:desktop-layout` after adding or changing a page. The check fails
if a page omits the fixed layout files, forces 100% initial zoom or
reintroduces width-dependent reflow code.
