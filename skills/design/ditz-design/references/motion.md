# Preset Gerak (17 preset)

Durasi dan easing di sini buat referensi; yang wajib: konsisten, ada alasan, dan hormati prefers-reduced-motion.

- **Hover Micro-interaction** (Subtle): trigger hover, durasi 150-200ms, easing power1.out. Do: Keep displacement under 2px so it reads as feedback not motion
- **Hover Micro-interaction** (Standard): trigger hover, durasi 200-300ms, easing power2.out. Do: Pair with a matching mouseleave tween that reverses the same properties
- **Hover Micro-interaction** (Complex): trigger hover + mousemove, durasi 300-500ms, easing elastic.out(1,0.4). Do: Clamp the pull strength (e.g. * 0.3) so the element never fully leaves its hit box
- **Scroll Reveal** (Subtle): trigger scroll (viewport enter), durasi 300-400ms, easing power1.out. Do: Keep the y offset small (8-16px) so it reads as a fade, not a slide
- **Scroll Reveal** (Standard): trigger scroll (viewport enter), durasi 400-600ms, easing power2.out. Do: Scope the ScrollTrigger to the section container so it doesn't re-scan the whole page
- **Scroll Reveal** (Complex): trigger scroll (continuous scrub), durasi tied to scroll position, easing none (scrub-driven). Do: Use scrub: true or a small number (0.5-1.5) instead of instant jumps so it feels tied to the scrollbar
- **Stagger List** (Subtle): trigger load or scroll, durasi 250-350ms, easing power1.out. Do: Keep per-item stagger delay small (0.02-0.04s) for lists longer than 10 items
- **Stagger List** (Standard): trigger load or scroll, durasi 300-450ms, easing back.out(1.4). Do: Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- **Stagger List** (Complex): trigger load or scroll, durasi 400-700ms, easing expo.out. Do: Revert SplitText on unmount/cleanup (split.revert()) to restore original text nodes for accessibility tools
- **Page Transition** (Subtle): trigger route change, durasi 200-300ms, easing power1.inOut. Do: Preload the destination route's critical assets before the exit tween finishes
- **Page Transition** (Standard): trigger route change, durasi 400-600ms, easing power2.inOut. Do: Show a lightweight loading indicator if the destination route's data fetch outlasts the overlay
- **Page Transition** (Complex): trigger route change, durasi 500-800ms, easing expo.inOut. Do: Verify the shared element exists in both DOM states before calling Flip.from to avoid a silent no-op
- **Parallax Scroll** (Subtle): trigger scroll (continuous), durasi tied to scroll position, easing linear (scrub). Do: Keep the yPercent delta small (5-15) so foreground and background never desync distractingly
- **Parallax Scroll** (Standard): trigger scroll (continuous), durasi tied to scroll position, easing linear (scrub). Do: Vary speed per layer (background slowest, foreground fastest) to sell the depth illusion
- **Loading / Skeleton** (Subtle): trigger on mount / async wait, durasi 1200-1600ms loop, easing sine.inOut. Do: Use a CSS gradient background-position sweep rather than opacity pulsing; reads as 'loading' more clearly
- **Loading / Skeleton** (Standard): trigger on mount / async wait, durasi 800-1200ms loop, easing power1.inOut. Do: Cap total loop duration under ~1.5s so long waits don't feel like the UI froze on a single beat
- **Carousel / Auto-Rotation** (Standard): trigger timer / focus / hover / visibility, durasi user-controlled or stopped, easing none. Do: Provide previous/next and play/pause controls; announce the current slide without moving focus
