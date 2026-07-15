# Sprint UI/UX Enhancement

**Sprint:** UI/UX Enhancement

**Tanggal Mulai:** - 

**Durasi:** 5 hari

**Tujuan Sprint**

Meningkatkan kualitas UI/UX CRM agar tidak kaku, lebih modern, dan memberikan pengalaman pengguna yang lebih baik melalui design system, animasi, loading states, dan micro-interactions.

---

# Sprint Goal

Pada akhir sprint:

* Design system yang konsisten (warna, typography, spacing, shadows)
* Animasi dan transisi yang smooth
* Loading states yang informatif (skeleton, spinner)
* Toast notification system yang konsisten
* Empty states yang menarik
* Error states yang informatif
* Micro-interactions pada button, card, dan elemen interaktif lainnya

---

# Product Backlog yang Masuk Sprint

## Epic - Design System

### US-031

Sebagai pengguna, saya melihat UI yang konsisten dan modern di seluruh aplikasi.

Acceptance Criteria:

* Color system yang terdefinisi (primary, success, warning, danger, neutral)
* Typography scale yang konsisten (heading 1-6, body, small, caption)
* Spacing system berbasis 4px grid
* Shadow levels (sm, md, lg, xl)
* Border radius yang konsisten
* Component variants (button sizes, card styles, badge variants)

Story Point:

8

---

## Epic - Animations & Transitions

### US-032

Sebagai pengguna, saya melihat transisi yang smooth saat berpindah halaman atau melakukan aksi.

Acceptance Criteria:

* Page transition animations (fade, slide)
* Modal open/close animations
* Sidebar collapse/expand animation
* Tab switch animations
* Card hover effects (scale, shadow)
* Button click effects (scale down)
* Table row hover effects

Story Point:

5

---

## Epic - Loading States

### US-033

Sebagai pengguna, saya melihat loading indicator yang jelas saat data sedang dimuat.

Acceptance Criteria:

* Skeleton loading untuk table rows
* Skeleton loading untuk cards
* Skeleton loading untuk charts
* Spinner untuk button loading states
* Progress bar untuk upload/import operations
* Loading state yang konsisten di seluruh aplikasi

Story Point:

5

---

## Epic - Toast Notification System

### US-034

Sebagai pengguna, saya mendapat feedback yang jelas setelah melakukan aksi.

Acceptance Criteria:

* Toast success untuk aksi berhasil
* Toast error untuk aksi gagal
* Toast warning untuk peringatan
* Toast info untuk informasi
* Auto-dismiss setelah 3-5 detik
* Manual dismiss dengan tombol close
* Position konsisten (top-right atau bottom-right)
* Animasi slide-in dan slide-out

Story Point:

5

---

## Epic - Empty States

### US-035

Sebagai pengguna, saya melihat halaman yang menarik saat tidak ada data.

Acceptance Criteria:

* Empty state untuk Customer List (belum ada customer)
* Empty state untuk Activity Timeline (belum ada aktivitas)
* Empty state untuk Follow-up (belum ada follow-up)
* Empty state untuk Quotation (belum ada quotation)
* Empty state untuk Reports (belum ada data)
* Ilustrasi atau ikon yang relevan
* Pesan yang informatif dan ajakan bertindak (CTA)
* Tombol aksi (Tambah Data, Import, dll)

Story Point:

5

---

## Epic - Error States

### US-036

Sebagai pengguna, saya melihat pesan error yang informatif saat terjadi kesalahan.

Acceptance Criteria:

* Error boundary untuk page-level errors
* Error state untuk failed data fetch
* Error state untuk form validation
* Error state untuk network errors
* Tombol retry untuk memuat ulang data
* Pesan error yang user-friendly (bukan technical jargon)
* Error illustration yang menarik

Story Point:

5

---

## Epic - Micro-interactions

### US-037

Sebagai pengguna, saya merasakan responsivitas saat berinteraksi dengan elemen UI.

Acceptance Criteria:

* Button hover: subtle scale + shadow
* Button active: scale down effect
* Card hover: lift effect (shadow increase)
* Input focus: border color change + glow
* Checkbox/radio: check animation
* Toggle switch: smooth transition
* Dropdown: smooth open animation
* Accordion: smooth expand/collapse
* Badge: pulse animation untuk notifications
* Avatar: fade-in on load

Story Point:

8

---

## Epic - Visual Polish

### US-038

Sebagai pengguna, saya melihat UI yang lebih polished dan profesional.

Acceptance Criteria:

* Consistent border radius (sm: 6px, md: 8px, lg: 12px, full: 9999px)
* Subtle gradients untuk headers/hero sections
* Backdrop blur untuk modals/dropdowns
* Better visual hierarchy dengan typography
* Consistent icon sizes (sm: 16px, md: 20px, lg: 24px)
* Better color contrast untuk accessibility
* Refined hover states untuk all interactive elements

Story Point:

5

---

# Task Breakdown

## Day 1: Design System Foundation

### Tailwind Config
* Update `tailwind.config.ts`:
  * Custom colors (primary, success, warning, danger)
  * Custom typography scale
  * Custom spacing extensions
  * Custom box shadows
  * Custom border radius
  * Custom animations

### Global CSS
* Update `globals.css`:
  * CSS variables untuk colors
  * Typography utilities
  * Animation keyframes
  * Skeleton loading styles
  * Print styles improvements

### Component Variants
* Update button components dengan variants:
  * sizes: sm, md, lg
  * variants: primary, secondary, outline, ghost, danger
  * loading state

---

## Day 2: Animations & Transitions

### Framer Motion Setup
* Install `framer-motion`
* Create wrapper components:
  * `FadeIn` - fade animation
  * `SlideIn` - slide animation
  * `ScaleIn` - scale animation
  * `StaggerChildren` - staggered animation

### Page Transitions
* Add page transition wrapper di layout
* Implement route change animations

### Component Animations
* Modal: backdrop fade + content scale
* Sidebar: smooth collapse/expand
* Dropdown: slide down + fade
* Tabs: underline滑动 indicator

### Hover Effects
* Card: shadow-lg + slight scale
* Button: scale-105
* Table row: background change
* Link: color transition

---

## Day 3: Loading & Empty States

### Skeleton Components
* Create `Skeleton` base component
* Create `SkeletonCard` for cards
* Create `SkeletonTable` for tables
* Create `SkeletonChart` for charts
* Create `SkeletonText` for text blocks

### Spinner Components
* Create `Spinner` component (multiple sizes)
* Create `LoadingButton` with spinner
* Create `LoadingOverlay` for page loading

### Empty State Components
* Create `EmptyState` component with:
  * Icon/illustration
  * Title
  * Description
  * CTA button
* Create specific empty states for each module

---

## Day 4: Toast & Error States

### Toast System
* Install `sonner` atau `react-hot-toast`
* Create `ToastProvider` component
* Create toast utility functions:
  * `showSuccess(message)`
  * `showError(message)`
  * `showWarning(message)`
  * `showInfo(message)`
* Integrate ke semua form submissions dan aksi

### Error Boundary
* Create `ErrorBoundary` component
* Create `ErrorFallback` component dengan retry button
* Wrap pages dengan ErrorBoundary

### Error States
* Create `ErrorState` component untuk failed fetch
* Create `NetworkError` component
* Create `ValidationError` display

---

## Day 5: Micro-interactions & Polish

### Micro-interactions
* Create `HoverScale` wrapper component
* Create `PressAnimation` for buttons
* Create checkbox/radio animations
* Create toggle switch animation
* Add input focus animations

### Visual Polish
* Refine all spacing inconsistencies
* Add subtle gradients where appropriate
* Improve shadow hierarchy
* Refine icon sizes across components
* Check color contrast ratios

### Testing & Cleanup
* Test all animations di Chrome, Firefox, Safari
* Check performance (no jank)
* Cleanup unused CSS
* Update component documentation

---

# Deliverables

## Files to Create
* `src/components/ui/skeleton.tsx` - Skeleton components
* `src/components/ui/spinner.tsx` - Spinner component
* `src/components/ui/empty-state.tsx` - Empty state component
* `src/components/ui/error-state.tsx` - Error state component
* `src/components/ui/toast.tsx` - Toast system
* `src/components/ui/hover-card.tsx` - Animated card wrapper
* `src/components/motion/fade-in.tsx` - Fade animation wrapper
* `src/components/motion/slide-in.tsx` - Slide animation wrapper
* `src/components/motion/stagger.tsx` - Stagger animation wrapper

## Files to Update
* `tailwind.config.ts` - Design tokens
* `src/app/globals.css` - Animations & variables
* `src/components/sidebar.tsx` - Animations
* `src/components/navbar.tsx` - Animations
* `src/app/(dashboard)/customers/page.tsx` - Skeleton, empty state, toast
* `src/app/(dashboard)/customers/[id]/page.tsx` - Skeleton, empty state, toast
* `src/app/(dashboard)/dashboard/page.tsx` - Skeleton, animations
* `src/app/(dashboard)/pipeline/page.tsx` - Drag animations
* `src/app/(dashboard)/quotations/page.tsx` - Skeleton, empty state, toast
* `src/app/(dashboard)/followups/page.tsx` - Skeleton, empty state
* `src/app/(dashboard)/reports/page.tsx` - Skeleton, animations
* `src/app/(dashboard)/activity-log/page.tsx` - Empty state, animations

---

# Definition of Done

Sprint dinyatakan selesai jika:

* Design system konsisten di seluruh aplikasi
* Animasi dan transisi berfungsi smooth (60fps)
* Skeleton loading muncul saat data dimuat
* Empty states muncul saat tidak ada data
* Error states muncul saat terjadi error
* Toast notifications berfungsi untuk semua aksi
* Micro-interactions berfungsi di semua elemen interaktif
* Tidak ada performance regression
* Tidak ada error kritis

---

# Technical Notes

## Framer Motion
```bash
npm install framer-motion
```

## Toast Library Options
```bash
# Option 1: Sonner (recommended - lightweight)
npm install sonner

# Option 2: React Hot Toast
npm install react-hot-toast
```

## Skeleton Pattern
```tsx
// Contoh penggunaan skeleton
{isLoading ? (
  <SkeletonCard count={6} />
) : (
  <CustomerCards data={customers} />
)}
```

## Animation Pattern
```tsx
// Contoh penggunaan animation wrapper
<FadeIn delay={0.1}>
  <Card>...</Card>
</FadeIn>

<StaggerChildren>
  {items.map(item => (
    <motion.div key={item.id}>
      <Card>{item.name}</Card>
    </motion.div>
  ))}
</StaggerChildren>
```

---

# References

* [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
* [Framer Motion](https://www.framer.com/motion/)
* [Shadcn UI](https://ui.shadcn.com/)
* [WCAG Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
