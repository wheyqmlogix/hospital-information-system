---
name: Cliniq HIS
description: Institutional-Grade Medical Information System
colors:
  primary: "#0f172a"
  accent: "#0e7490"
  neutral-bg: "#ffffff"
  neutral-surface: "#f8fafc"
  neutral-border: "#e2e8f0"
  triage-1: "#991b1b"
  triage-2: "#9a3412"
  triage-3: "#854d0e"
  triage-4: "#166534"
  triage-5: "#1e40af"
typography:
  display:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  sm: "2px"
  md: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "6px 14px"
  card-institutional:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "20px"
---

# Design System: Cliniq HIS

## 1. Overview

**Creative North Star: "Institutional Calm"**

Cliniq HIS is designed for the modern hospital institution. It rejects the "Command Center" aesthetic in favor of "Institutional Calm"—a refined, monochromatic, and deeply professional interface that prioritizes visual silence and data clarity. It is inspired by Swiss design principles: high-quality typography, rigid grids, and a near-total reliance on negative space rather than decoration. It feels like a high-end medical journal or a trusted clinical reference.

**Key Characteristics:**
- **Monochromatic Foundations:** The UI is primarily white and cool gray. Deep navy (#0f172a) is used for authority and focus.
- **Visual Silence:** Minimized use of icons, shadows, and borders. Depth is created through a "Planimetric" (layered flat) approach.
- **Technical Precision:** Use of thin, 1px lines and precise alignment to convey a sense of surgical accuracy.
- **Typographic Authority:** Large, bold headings paired with small, dense, yet legible data labels.

## 2. Colors

The palette is restrained and institutional, using high-contrast neutrals to create a focused clinical environment.

### Primary (Authority)
- **Midnight Navy** (#0f172a): Used for headers, primary actions, and key navigation anchors.

### Accent (Clinical)
- **Clinical Slate** (#475569): Used for secondary utility and technical details.

### Functional (Muted Triage)
- **L1 (Immediate)** (#991b1b): Deep red (Muted for professionalism).
- **L2 (Emergent)** (#9a3412): Deep orange.
- **L3 (Urgent)** (#854d0e): Deep gold.
- **L4 (Less Urgent)** (#166534): Deep green.
- **L5 (Non-Urgent)** (#1e40af): Deep blue.

### Neutral
- **Paper White** (#ffffff): The primary background for all workspaces.
- **Clinic Gray** (#f1f5f9): Used for subtle background shifts and dividers.

### Named Rules
**The No-Color Rule.** Color is prohibited except for clinical status or the primary Midnight Navy anchor. Never use color for purely aesthetic branding.
**The Line-Over-Shadow Rule.** Never use shadows for depth. Use 1px #e2e8f0 lines to define boundaries.

## 3. Typography

**Display Font:** Geist Sans (with high-weight focus)
**Body Font:** Geist Sans (with high-density focus)

### Hierarchy
- **Display** (800, 1.875rem, 1.1): Precise, heavy titles for page headers.
- **Section** (700, 0.75rem, 1): All-caps, tracked-out headers for record sections.
- **Data Body** (500, 0.8125rem, 1.6): High-readability font for clinical notes and data.
- **Technical Label** (700, 0.6875rem, 1): The "Workhorse" label for table headers and form fields.

## 4. Elevation

The system is entirely flat. Depth is managed through tonal shifts of white and off-white.

### Named Rules
**The Flat Plane Rule.** All information exists on a single logical plane. Modals and overlays are defined by strong 1px borders and high-contrast backdrops, never shadows.

## 5. Components

### Buttons
- **Shape:** Square (2px radius).
- **Primary:** Midnight Navy with white text. Ultra-compact (h-8).
- **Treatment:** Matte finish. No gradients, no glows.

### Sidebar (Institutional)
- **Style:** Light background (#ffffff). 
- **Indicator:** 2px Midnight Navy left-border for active state.
- **Typo:** Technical Label (All-caps).

### Record Cards
- **Style:** Pure white background with a simple 1px #e2e8f0 border. No internal padding except what is strictly necessary for the grid.

### Input Language (Institutional)
Form fields must feel like a precision instrument.
- **Surface:** Ice White (Subtle #f8fafc tint).
- **Border:** Silver (1px #cbd5e1).
- **Focus:** Technical Navy (1px #0f172a). No rings, no shadows.
- **Radius:** 2px (Sharp).

## 6. Do's and Don'ts

### Do:
- **Do** use whitespace as a primary separator.
- **Do** use all-caps for technical labels and table headers.
- **Do** align everything to a strict 4px/8px grid.
- **Do** use #0f172a (Midnight Navy) for all focus states.

### Don't:
- **Don't** use a dark sidebar.
- **Don't** use rounded corners greater than 4px.
- **Don't** use shadows or glows.
- **Don't** use blue-600 or any "SaaS" teal.
- **Don't** use blue focus rings on inputs.
