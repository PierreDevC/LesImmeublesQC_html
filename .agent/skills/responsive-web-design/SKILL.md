---
name: responsive-web-design
description: Formats, styles, and refactors frontends using fluid layouts, mobile-first design, and modern CSS practices.
commands:
  - /refactor-responsive
---

# Skill: Responsive Web Design

## Requirements & Scope
- Active only when modifying or creating HTML, CSS, React, or Vue frontend files.
- Restrict logic entirely to presentation layers.

## Instructions
1. Always adopt a mobile-first philosophy (design for min-width media queries).
2. Avoid fixed widths (`px`). Instead, enforce relative units like `rem`, `em`, `vw`, and `%`.
3. Use CSS Grid for overall page layouts and Flexbox for 1D component alignments.

## Multi-Step Workflows
When asked to build or refactor a layout:
1. Scan existing layout files for rigid pixel dimensions.
2. Draft a layout strategy utilizing CSS variables for breakpoints.
3. Automatically execute the bundled verification script `./scripts/validate-viewport.py`.

## Examples
### Bad Practice
```css
.container { width: 1200px; margin: 0 auto; }
```

### Good Practice
```css
.container { width: 100%; max-width: 75rem; margin: 0 auto; padding: 0 1rem; }
```
