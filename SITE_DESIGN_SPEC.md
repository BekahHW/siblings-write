You are working in the Siblings Write repository:

https://github.com/BekahHW/siblings-write

Your task is to take the existing `/works` experience from a beautifully themed fantasy-library page to a highly polished, interactive, living environment.

The goal is NOT to redesign the page from scratch.

The current library concept is strong. Preserve its visual language, bookshelf interaction, open-book reader, typography, content, accessibility, responsive behavior, and overall atmosphere.

The conceptual rule for every decision is:

**This is a magical library where the stories are alive.**

We want the level of interaction polish and conceptual consistency seen in high-end portfolio experiences such as Braydon Coyer's Museum, but we DO NOT want to copy its visual aesthetic. Siblings Write should be considerably more whimsical, narrative-driven, magical, warm, surprising, and storybook-like.

## First: inspect before changing

Read the existing implementation carefully, particularly:

- `src/pages/works.astro`
- `src/components/Bookshelf.astro`
- `src/components/library/LibraryTree.astro`
- `src/components/library/Owl.astro`
- `src/components/library/StainedGlassWindow.astro`
- other components under `src/components/library/`
- `src/pages/works/[slug].astro`
- `src/content/config.ts`
- the current works content entries
- relevant BaseLayout/global styling

Understand and preserve:

- the accessible bookshelf tablist
- keyboard navigation
- selected-book states
- horizontal shelf behavior
- the existing page-turn implementation
- `prefers-reduced-motion`
- the offscreen animation pausing using IntersectionObserver
- mobile/touch behavior
- semantic Book markup/structured data

Do not replace working accessible interactions with div-based custom interactions.

## Technical constraint

Do NOT add GSAP, Framer Motion, Motion, Three.js, or another large animation/runtime dependency unless there is an absolutely unavoidable reason.

Prefer:

- CSS transforms/animations
- SVG
- CSS custom properties
- requestAnimationFrame
- Web Animations API when useful
- IntersectionObserver
- small vanilla TypeScript/JavaScript modules

Keep the page light and performant.

## Step 1: refactor for maintainability without changing the visible result

`src/pages/works.astro` and the individual work page are becoming too large to safely continue layering behavior into.

Extract logical pieces where appropriate.

Suggested boundaries, but adjust after inspecting the implementation:

- `LibraryAmbience.astro`
- `LibraryThreshold.astro`
- `StoryReader.astro`
- `ReadersNook.astro`
- `WorkAtmosphere.astro`
- a small library interaction module rather than continuing to grow the inline script

Do not refactor simply for refactoring's sake. Preserve existing behavior first.

## Step 2: introduce a data-driven "story world"

Extend the works content schema with an optional experience configuration.

It should support concepts equivalent to:

- archive/library record number
- story classification
- location
- atmosphere/world identifier
- librarian note
- optional secret text

For example, the four current environments should map approximately to:

- `valley`
- `christmas`
- `island`
- `sandbridge`

Do NOT scatter conditionals like `if (work.id === "...")` throughout presentation components.

The visual system should be driven by the work's experience metadata.

## Step 3: make the library react to the selected book

Add a world state to the main library element.

Conceptually:

`data-world="island"`

Hovering/focusing a book may temporarily preview its world.

Selecting/clicking the book commits that world.

When the world changes, subtly change the ENVIRONMENT, not the main page layout.

### Valley of Almost True Things

Use restrained ideas such as:

- slightly greener ambient light
- firefly-like points
- a paw print appearing occasionally
- leaf movement
- a faintly uncanny glow

### Battle for Christmas

Use:

- warmer lights
- very subtle snow visible around/through windows
- Christmas-like warmth in existing bulbs
- an occasional distant nutcracker-shaped shadow

Do not turn the room into a red-and-green Christmas website.

### Escape from Browns Island

Use:

- cooler lighting
- subtle fog low in the environment
- weak moving water reflections
- lantern-like warm light
- slightly quieter/slower ambient motion

### Mitch and the Sand Bridge

Use:

- brighter coastal light
- extremely subtle water caustics
- sand/dust movement
- a rare playful tentacle or portal-like visual

All environmental changes should transition gracefully.

The user should feel as though selecting a story is affecting the library itself.

## Step 4: make existing environmental objects visitor-aware

For fine-pointer devices only, add restrained pointer response.

Examples:

- tree/canopy shifts a few pixels with pointer movement
- foreground ivy has slightly stronger parallax
- stained-glass lighting shifts subtly
- lamp illumination can shift a small amount horizontally
- owl pupils/eyes follow the pointer within a VERY small range
- ambient particles respond very slightly

Use a requestAnimationFrame loop or CSS variables rather than firing expensive layout work on every pointer event.

Do not implement dramatic cursor-following animation.

The desired reaction is:

"Wait, did the room move?"

not:

"Look at this parallax effect."

Disable this behavior for reduced-motion users and where pointer precision/touch makes it inappropriate.

## Step 5: add rare ambient events

Add a tiny ambient-event controller.

Events should be:

- uncommon
- random/semi-random
- never simultaneous
- non-blocking
- decorative only
- disabled/reduced appropriately under reduced-motion
- suspended when the relevant area is offscreen

Possible events:

- owl head tilt
- falling leaf
- one book shifting slightly
- one light flickering briefly
- tiny shadow crossing a distant wall/window
- small mouse or magical creature passing behind the shelf
- story-specific paw print
- an almost-imperceptible book opening and closing

Do NOT make these loop continuously.

The environment should feel inhabited, not animated.

## Step 6: enhance the open-book content with library lore

Keep the story, summary, inspiration and purchase actions.

Add a small "library record" treatment that can display the new metadata.

Example conceptual content:

LIBRARY RECORD · 003

Escape from Browns Island

Ohio River
Island Story · Local Lore · Adventure

Librarian's note:
"Returned damp. Again."

The exact copy should come from content metadata, not presentation components.

Design this like information that belongs inside the physical library—not like a SaaS metadata card.

## Step 7: redesign individual `/works/[slug]` pages into story worlds

This is very important.

Currently the library experience becomes much more conventional after clicking "Read more."

Create a reusable story-world system so every individual work page feels like the visitor has left the library and entered that story.

Do NOT build four unrelated pages.

Build shared structural components with data-driven atmosphere variants.

The core information architecture can remain consistent:

- hero
- book information
- logline
- purchase links
- story summary
- inspiration
- playlist/trailer if available
- CTA

But the physical/environmental presentation should be influenced by the selected story.

Use the same four atmosphere identities described above.

Remove one-off hardcoded special-case visual logic where it can cleanly be represented by the shared experience system.

Do not sacrifice SEO, textual content, semantic headings or accessibility for visuals.

## Step 8: create a polished library → story transition

Progressively enhance the existing "Read more" link.

The interaction should feel approximately like:

1. current open book becomes the visual focus
2. surrounding library dims subtly
3. the book cover/spread moves toward the foreground
4. the selected story atmosphere strengthens
5. navigation occurs
6. the destination story page visually resolves from the same book/world

Use native browser/CSS capabilities where practical.

There MUST be a completely functional normal-link fallback.

Do not make navigation depend on animation completing.

Respect reduced motion.

## Step 9: remember visited books

Use lightweight localStorage only.

No login and no server state.

Store visited works.

When a user has previously opened/read a work, give that book a subtle physical sign in the library, such as a bookmark ribbon.

On a returning visit, an understated line such as:

"Welcome back. The library kept your place."

may appear.

Do not create badges, XP, points, progress percentages or a gamification dashboard.

The library remembers through its environment.

## Step 10: one discoverable secret

Add ONE high-quality hidden interaction, preferably associated with the tree.

For example:

- a very small carved symbol in the trunk
- it subtly reacts on hover/focus
- activating it opens a concealed archive/panel
- the archive contains a short piece of hidden lore/content
- discovery may be remembered in localStorage

The interaction must also be keyboard discoverable once focused and should not contain important site content that is unavailable elsewhere.

Do not add multiple easter eggs yet.

Quality over quantity.

## Design restraint

The biggest risk is over-animation.

Avoid:

- constant sparkles everywhere
- generic floating particles
- huge parallax shifts
- every object moving
- neon glows
- fantasy-game HUD styling
- autoplay audio
- fake loading screens
- excessive custom cursors
- scroll hijacking
- long animation delays before content becomes usable

Magic should come from objects behaving plausibly inside the fictional library.

Ask of every effect:

"Would this make sense if this library were a real enchanted place?"

If not, cut it.

## Accessibility and motion

Preserve and improve the current accessibility baseline.

Requirements:

- all shelf keyboard behavior remains functional
- focus states remain visible
- interactive secrets must be keyboard operable
- decorative animations are `aria-hidden`
- reduced-motion mode must remove meaningful transforms/continuous movement
- no interaction should require hover
- touch users must be able to access equivalent story content
- no auto-playing audio
- content remains usable with JavaScript failure where practical

Also add reduced-motion treatment to individual work-page effects where it is currently missing.

## Performance

Maintain the existing philosophy of pausing offscreen ambient animation.

Avoid:

- layout reads in pointermove loops
- hundreds of animated DOM elements
- large runtime animation libraries
- enormous raster overlays
- unnecessary re-renders

Prefer transforms/opacity and compositor-friendly effects.

## Cleanup opportunity

Review the global reading progress treatment on immersive work pages.

The current generic sparkle may no longer match the refined physical library metaphor.

If appropriate, replace or theme it on work pages as something belonging to this world, such as:

- ribbon bookmark
- brass page marker
- ink line

Do not make this change globally if it damages other areas of the site.

## Definition of done

The finished experience should satisfy these statements:

1. The current library design is still clearly recognizable.
2. Nothing feels like a total redesign.
3. Selecting different books changes the emotional atmosphere of the room.
4. Environmental objects subtly notice the visitor.
5. Occasionally something unexpected happens.
6. Story metadata feels like lore from a real library.
7. Clicking into an individual book no longer breaks immersion.
8. All four current books feel distinct while using one reusable system.
9. A returning visitor can see evidence that the library remembers them.
10. There is one delightful hidden discovery.
11. Keyboard, mobile and reduced-motion experiences remain first-class.
12. Performance remains excellent.
13. No large animation dependency has been introduced.

## Verification

Before finishing:

- run `npm run build`
- run the existing test suite
- inspect desktop and mobile layouts
- test keyboard-only shelf navigation
- test the hidden interaction by keyboard
- test `prefers-reduced-motion`
- test touch-sized viewport behavior
- test switching books rapidly during page-turn animation
- test navigation during/after transitions
- verify no console errors
- verify all individual work pages still expose their textual content and structured Book data

When you finish, summarize:

1. files changed
2. architecture introduced
3. behavior added
4. accessibility/performance decisions
5. anything deliberately NOT implemented because it would make the experience less restrained