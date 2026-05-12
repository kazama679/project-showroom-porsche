# Quick Reference - Porsche Admin Portal

## 🚀 Getting Started (2 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm dev

# 3. Open browser
# Navigate to http://localhost:3000
# You'll be auto-redirected to /admin
```

---

## 📍 Main Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing page (auto-redirects to `/admin`) | ✅ |
| `/admin` | Main dashboard with stats & charts | ✅ |
| `/admin/cars` | Car inventory CRUD management | ✅ |
| `/admin/test-drives` | Test drive request approval | ✅ |

---

## 🎨 Design System at a Glance

### Colors (Use These)
```
Primary Action:   #DA291C  (Ferrari Red)
Hover State:      #B01E0A  (Dark Red)
Sidebar:          #000000  (Black)
Cards:            #FFFFFF  (White)
Borders:          #D2D2D2  (Light Gray)
Text:             #181818  (Near Black)
Success:          #03904A  (Green)
Pending:          #F6E500  (Yellow)
Error:            #F13A2C  (Red)
```

### Class Names (Use These)
```
Buttons:
  .ferrari-btn-primary      → Red button
  .ferrari-btn-secondary    → White button
  .ferrari-btn-ghost        → Transparent button

Text:
  .text-ferrari-heading     → 26px title
  .text-ferrari-subheading  → 18px subtitle
  .text-ferrari-label       → 12px uppercase label
  .text-ferrari-body        → 16px body text

Cards:
  .ferrari-card             → White card
  .ferrari-card-dark        → Dark card
```

### Status Colors
```
.bg-[#03904A]/10 text-[#03904A]  → Approved (Green)
.bg-[#F6E500]/10 text-[#F6E500]  → Pending (Yellow)
.bg-[#F13A2C]/10 text-[#F13A2C]  → Rejected (Red)
.bg-[#4C98B9]/10 text-[#4C98B9]  → Booked (Blue)
```

---

## 📋 Common Code Patterns

### Button
```tsx
<button className="ferrari-btn-primary">
  Click me
</button>
```

### Card
```tsx
<div className="ferrari-card p-6">
  <h3 className="text-ferrari-subheading">Title</h3>
  <p className="text-ferrari-body">Content</p>
</div>
```

### Status Badge
```tsx
<span className="px-3 py-1 bg-[#03904A]/10 text-[#03904A] 
  rounded-[2px] text-xs font-medium uppercase tracking-wider">
  Approved
</span>
```

### Form Input
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-[#D2D2D2] 
    rounded-[2px] bg-white dark:bg-[#303030] 
    text-black dark:text-white"
/>
```

### Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Items */}
</div>
```

---

## 🎯 Page Features Quick List

### Admin Dashboard (`/admin`)
- ✅ 4 statistics cards with metrics
- ✅ Line chart (bookings trend)
- ✅ Pie chart (car categories)
- ✅ Recent activity feed
- **Mock Data:** Pre-loaded with sample stats

### Car Management (`/admin/cars`)
- ✅ **Create:** Add new cars via modal form
- ✅ **Read:** Grid view of all cars
- ✅ **Update:** Click "Edit" to modify
- ✅ **Delete:** Click trash icon to remove
- **Fields:** Brand, Series, Model, Year, Color, Image, Options, Status
- **Mock Data:** 3 sample Porsche cars

### Test Drive Requests (`/admin/test-drives`)
- ✅ **List:** All requests with filters
- ✅ **Filter:** By status (Pending/Approved/Rejected/Completed)
- ✅ **Approve:** Change pending to approved
- ✅ **Reject:** Deny request
- ✅ **Complete:** Mark as done
- **Fields:** Name, Email, Phone, Car, Dates, License, Notes
- **Mock Data:** 4 sample requests

---

## 🔧 File Locations

### Pages
```
app/page.tsx                → Landing page
app/admin/page.tsx          → Dashboard
app/admin/cars/page.tsx     → Car management
app/admin/test-drives/page.tsx → Test drives
```

### Styling
```
app/globals.css             → Design tokens & utilities
app/layout.tsx              → Root layout
app/admin/layout.tsx        → Admin sidebar layout
```

### Documentation
```
README.md                   → Getting started
DESIGN.md                   → Design system (from Ferrari)
DESIGN_TOKENS.md            → Token reference
EXAMPLES.md                 → Code examples
PORSCHE_ADMIN_GUIDE.md      → Feature guide
PROJECT_SUMMARY.md          → Project overview
QUICK_REFERENCE.md          → This file
```

---

## 🖥️ Dark Mode

### How It Works
1. Browser detects `prefers-color-scheme: dark`
2. `.dark` class applied to `<html>` element
3. CSS variables switch automatically
4. Tailwind `dark:` prefix applies alternate styles

### Testing Dark Mode
```bash
# In browser DevTools:
# 1. Inspect <html> element
# 2. Add class "dark" manually
# OR use browser's dark mode preference
```

### Making Dark-Aware Component
```tsx
<div className="bg-white dark:bg-[#303030]">
  <p className="text-black dark:text-white">
    This adapts to dark mode
  </p>
</div>
```

---

## 📱 Responsive Breakpoints

```
Mobile:   < 768px
Tablet:   768px - 1023px   (md: prefix in Tailwind)
Desktop:  1024px+          (lg: prefix in Tailwind)
```

### Example
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
</div>
```

---

## 🚨 Common Mistakes & Fixes

| Problem | Solution |
|---------|----------|
| Styles not working | Restart dev server: `pnpm dev --clear` |
| Dark mode not working | Ensure `.dark` class on `<html>` element |
| Types errors | Run `pnpm tsc --noEmit` to check |
| Import errors | Verify file paths are absolute: `/app/...` |
| Image not showing | Use full URLs, not relative paths |
| Layout broken | Check for missing `className` attributes |

---

## 📊 Data Structures

### Car
```typescript
{
  id: string
  brand: string                    // "Porsche"
  series: string                   // "911"
  model: string                    // "Carrera"
  year: number                     // 2024
  color: string                    // "Racing Yellow"
  image: string                    // URL
  options: string[]                // ["Sunroof", "Carbon trim"]
  status: 'available'|'booked'|'maintenance'
}
```

### TestDriveRequest
```typescript
{
  id: string
  userName: string
  email: string
  phone: string
  carModel: string                 // "Porsche 911 Carrera"
  requestDate: string              // ISO date
  preferredDate: string            // ISO date
  licenseNumber: string
  status: 'pending'|'approved'|'rejected'|'completed'
  notes: string
}
```

### Stat Card
```typescript
{
  label: string                    // "Total Users"
  value: string                    // "2,847"
  change: string                   // "+12%"
  icon: React.ComponentType
}
```

---

## 🎯 Component Quick Copy

### Stats Card
```tsx
<div className="ferrari-card dark:ferrari-card-dark p-6">
  <p className="text-ferrari-label text-[#8F8F8F]">Label</p>
  <p className="text-ferrari-stat mt-2">2,847</p>
  <p className="text-ferrari-label text-[#03904A] mt-2">+12%</p>
</div>
```

### Modal Form
```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-[#303030] rounded-[2px] p-8 w-full max-w-md">
      <h2 className="text-ferrari-subheading mb-6">Form Title</h2>
      {/* Form fields */}
      <div className="flex gap-3 mt-8">
        <button className="flex-1 ferrari-btn-primary">Save</button>
        <button className="flex-1 ferrari-btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
)}
```

### List Item with Actions
```tsx
<div className="ferrari-card p-6">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-ferrari-subheading">Item Title</h3>
      <p className="text-ferrari-label text-[#8F8F8F]">Subtitle</p>
    </div>
    <StatusBadge status="approved" />
  </div>
  <div className="flex gap-2 pt-4 border-t border-[#D2D2D2]">
    <button className="flex-1 ferrari-btn-primary text-sm">Edit</button>
    <button className="px-3 py-2 bg-[#D2D2D2]">Delete</button>
  </div>
</div>
```

---

## 🔄 Component Reuse Example

### Define Once
```tsx
// components/StatusBadge.tsx
export function StatusBadge({ status }: { status: string }) {
  const colors = {
    approved: { bg: '[#03904A]/10', text: '[#03904A]' },
    pending: { bg: '[#F6E500]/10', text: '[#F6E500]' },
    rejected: { bg: '[#F13A2C]/10', text: '[#F13A2C]' },
  }
  const color = colors[status as keyof typeof colors] || colors.pending
  return (
    <span className={`px-3 py-1 bg-${color.bg} text-${color.text} 
      rounded-[2px] text-xs font-medium uppercase tracking-wider`}>
      {status}
    </span>
  )
}
```

### Use Everywhere
```tsx
<StatusBadge status="approved" />
<StatusBadge status="pending" />
<StatusBadge status="rejected" />
```

---

## 📈 Performance Tips

✅ **Do**
- Use React.memo for expensive components
- Implement proper key props in lists
- Lazy load images
- Split large components
- Use useCallback for event handlers

❌ **Don't**
- Create components inside render
- Use inline functions in JSX
- Forget key prop in loops
- Import entire libraries when you need one function
- Update state in render

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| Next.js Docs | https://nextjs.org/docs |
| React Docs | https://react.dev |
| Tailwind CSS | https://tailwindcss.com/docs |
| Recharts | https://recharts.org |
| Lucide Icons | https://lucide.dev |
| TypeScript | https://typescriptlang.org/docs |

---

## ⚡ Build & Deploy

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Deploy to Vercel
```bash
# Just push to GitHub and Vercel auto-deploys
git push origin main
```

### Environment Variables
```bash
# Create .env.local
DATABASE_URL=your_database_url
API_KEY=your_api_key
```

---

## 🎓 Learning Path

1. **Start Here:** Read README.md
2. **Understand Design:** Check DESIGN.md & DESIGN_TOKENS.md
3. **See Examples:** Browse EXAMPLES.md
4. **Explore Code:** Open `/app/admin/page.tsx` and read the comments
5. **Try Modifying:** Change colors in `globals.css`
6. **Add Features:** Create new pages in `/app/admin/`

---

## 💡 Quick Tips

### Hide Sidebar on Mobile
```tsx
className="hidden md:block"
```

### Full Width Container
```tsx
className="w-full"
```

### Center Content
```tsx
className="flex items-center justify-center"
```

### Responsive Padding
```tsx
className="p-4 md:p-6 lg:p-8"
```

### Dark Mode Aware Text
```tsx
className="text-black dark:text-white"
```

### Responsive Grid
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

---

## 📞 Need Help?

1. **TypeScript Errors:** Run `pnpm tsc --noEmit`
2. **Style Issues:** Check `app/globals.css`
3. **Component Example:** Look in `EXAMPLES.md`
4. **Design Question:** Check `DESIGN_TOKENS.md`
5. **Feature Help:** See `PORSCHE_ADMIN_GUIDE.md`

---

**Happy coding! 🚗💨**
