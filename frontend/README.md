# Porsche Admin Portal - Ferrari Design System

A luxury automotive administration dashboard built with Ferrari's editorial design language, featuring car inventory management, booking statistics, and test drive request handling.

**Design Inspiration:** `npx getdesign@latest add ferrari` - Premium, minimalist aesthetic with surgical precision and sophisticated restraint.

---

## 🎨 Design System Highlights

### Ferrari-Inspired Aesthetic
- **Color Palette**: Ferrari Red (`#DA291C`), absolute black, surgical whites, and grayscale neutrals
- **Typography**: Precise type scale with tight letter-spacing for professional authority
- **Components**: 2px border-radius for razor-sharp precision engineering feel
- **Layouts**: Chiaroscuro rhythm alternating between dark and light sections
- **Philosophy**: Photography and contrast create depth, not shadows

### Key Design Features
✅ Minimal, editorial design language  
✅ High-contrast black/white sections  
✅ Ferrari Red used sparingly for maximum impact  
✅ Semantic status colors (green/blue/red/yellow)  
✅ Premium typography hierarchy  
✅ Dark mode support built-in  
✅ Mobile-first responsive design  

---

## 📊 Dashboard Features

### 1. Admin Dashboard (`/admin`)
- **Statistics Cards**: Users, bookings, hot cars, pending test drives
- **Trend Chart**: Line chart tracking bookings and test drives over 6 months
- **Category Distribution**: Pie chart showing car category breakdown
- **Recent Activity**: Live feed of admin actions and user activities

### 2. Car Management (`/admin/cars`)
- **Create**: Add new cars with brand, series, model, year, color, image, and options
- **Read**: Grid view of all cars with images and details
- **Update**: Edit existing car information
- **Delete**: Remove cars from inventory

**Car Attributes:**
- Brand/Series/Model (e.g., Porsche 911 Carrera)
- Year and color specifications
- High-quality imagery
- Customizable options (sunroof, trim, suspension, etc.)
- Status tracking (Available/Booked/Maintenance)

### 3. Test Drive Requests (`/admin/test-drives`)
- **Request Management**: List all test drive requests with filtering
- **Status Workflow**: Pending → Approved → Completed or Rejected
- **User Information**: Name, email, phone, license number
- **Request Details**: Preferred date, car model, admin notes
- **Expandable Details**: Click eye icon to view full request information

**Status Filters:**
- All, Pending, Approved, Rejected, Completed
- Quick status badges with semantic colors
- Action buttons change based on current status

---

## 🚀 Quick Start

### Installation
```bash
# Clone or download the project
cd porsche-admin

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Project Structure
```
app/
├── globals.css              # Design tokens and Tailwind utilities
├── layout.tsx               # Root layout with dark mode support
├── page.tsx                 # Landing page (redirects to /admin)
└── admin/
    ├── layout.tsx           # Sidebar navigation layout
    ├── page.tsx             # Dashboard with statistics & charts
    ├── cars/
    │   └── page.tsx         # Car CRUD management
    └── test-drives/
        └── page.tsx         # Test drive request handling
```

---

## 🎯 Design Token Reference

### Color System
```css
/* Primary Brand */
--ferrari-red: #DA291C          /* Main CTA color */
--dark-red: #B01E0A             /* Hover states */
--deep-red: #9D2211             /* Active states */

/* Surfaces */
--absolute-black: #000000       /* Sidebar, heroes */
--dark-surface: #303030         /* Secondary dark */
--light-gray-surface: #D2D2D2   /* Borders */

/* Text */
--near-black: #181818           /* Primary text */
--dark-gray: #666666            /* Secondary text */
--mid-gray: #8F8F8F             /* Tertiary text */

/* Semantic */
--success-green: #03904A        /* Approved status */
--info-blue: #4C98B9            /* Info status */
--warning-red: #F13A2C          /* Rejected status */
--modena-yellow: #F6E500        /* Pending status */
```

### Typography Scale
```css
/* Component Classes */
.text-ferrari-heading       /* 26px, 500 weight, main titles */
.text-ferrari-subheading    /* 18px, 700 weight, section titles */
.text-ferrari-label         /* 12px, uppercase, tracking */
.text-ferrari-body          /* 16px, 400 weight, readable */
.text-ferrari-stat          /* 32px, 500 weight, statistics */

/* Button Classes */
.ferrari-btn-primary        /* Red button, primary actions */
.ferrari-btn-secondary      /* White button with border */
.ferrari-btn-ghost          /* Transparent with white border */

/* Card Classes */
.ferrari-card               /* Light card component */
.ferrari-card-dark          /* Dark card component */
```

---

## 🔧 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React hooks and SWR
- **Dark Mode**: Native Tailwind dark mode with CSS variables

---

## 📱 Responsive Breakpoints

```css
Mobile:    < 768px   (1 column layouts)
Tablet:    768px+    (2 columns)
Desktop:   1024px+   (3-4 columns)
Wide:      1920px+   (Max container width)
```

- Sidebar hidden on mobile, toggle with hamburger
- Stats: 1 col → 2 cols → 4 cols
- Cars: 1 col → 2 cols → 3 cols
- Adaptive padding and font sizes

---

## 🌓 Dark Mode

Fully supported throughout the interface:
- Toggle via browser preference or add manual switcher
- All colors automatically adjust via CSS variables
- Cards, text, and backgrounds invert appropriately

```css
/* Light mode (default) */
:root {
  --background: #FFFFFF;
  --foreground: #181818;
}

/* Dark mode */
.dark {
  --background: #000000;
  --foreground: #FFFFFF;
}
```

---

## 📊 Data & Charts

### Dashboard Charts
- **Line Chart**: Bookings and test drive trends
  - Monthly data points
  - Ferrari Red for bookings, Info Blue for test drives
  - Interactive tooltip and legend

- **Pie Chart**: Car category distribution
  - Sedan, Coupe, SUV, Roadster
  - Custom color palette matching design system

### Chart Styling
- No shadows or gradients
- Subtle grid lines in light gray
- Tooltips match design system styling
- Legend positioned for clarity

---

## 🔐 Production Readiness

### To Deploy
1. Add authentication middleware to protect `/admin` routes
2. Connect to real database (Supabase, Neon, etc.)
3. Use CDN or Blob storage for car images
4. Add form validation and error handling
5. Implement confirmation dialogs for destructive actions
6. Set up environment variables for secrets
7. Add analytics and monitoring
8. Configure CORS for API calls

### Security Considerations
- Protect admin routes with authentication
- Validate all user inputs
- Use environment variables for secrets
- Implement rate limiting
- Add audit logging for admin actions
- Use HTTPS in production

---

## 📝 Documentation Files

- **DESIGN.md** - Ferrari design system reference (npx getdesign output)
- **PORSCHE_ADMIN_GUIDE.md** - Complete feature documentation
- **DESIGN_TOKENS.md** - Comprehensive token reference with usage examples
- **README.md** - This file

---

## 🎨 Customization Guide

### Change Primary Color
Replace `#DA291C` throughout:
```css
/* globals.css */
--ferrari-red: YOUR_COLOR;
```

### Modify Typography
Edit type scale classes:
```css
.text-ferrari-heading {
  @apply text-[YOUR_SIZE] font-[YOUR_WEIGHT];
}
```

### Adjust Spacing
All spacing uses 8px base unit:
```css
/* In Tailwind classes */
p-4      /* 32px = 4 × 8px */
gap-6    /* 24px = 3 × 8px */
```

### Add New Components
Follow the pattern:
```tsx
// In globals.css
@layer components {
  .my-component {
    @apply p-4 rounded-[2px] border border-[#D2D2D2];
  }
}

// In JSX
<div className="my-component">Content</div>
```

---

## 🐛 Troubleshooting

### Dev server won't start
```bash
# Clear cache and reinstall
rm -rf .next node_modules
pnpm install
pnpm dev
```

### Styles not updating
```bash
# Tailwind may need rebuild
pnpm dev --clear
```

### Images not loading
- Ensure image URLs are valid
- Use CORS-friendly image hosts
- Test with different image sizes
- Check browser console for errors

### Dark mode not working
- Ensure `.dark` class is applied to `<html>` element
- Check Tailwind configuration
- Verify CSS variables are defined

---

## 📚 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Recharts**: https://recharts.org
- **Lucide Icons**: https://lucide.dev

---

## 📄 License

Created with v0.app - Vercel's AI code generator

---

## 🚀 Next Steps

1. **Deploy to Vercel**
   - Connect your GitHub repository
   - Deploy with one click
   - Automatic preview deployments

2. **Add Authentication**
   - Implement NextAuth.js or Supabase Auth
   - Protect `/admin` routes
   - Add user sessions

3. **Connect Database**
   - Choose: Supabase, Neon, or AWS Aurora
   - Create tables for cars and test drives
   - Replace mock data with real queries

4. **Implement Real Features**
   - API endpoints for CRUD operations
   - Real-time updates with WebSockets
   - Email notifications for approvals
   - File uploads for car images

5. **Launch**
   - Set up custom domain
   - Configure analytics
   - Monitor performance
   - Gather user feedback

---

## 💬 Support

For issues or questions:
1. Check documentation files (DESIGN.md, PORSCHE_ADMIN_GUIDE.md)
2. Review code comments and inline documentation
3. Check console for error messages
4. Visit v0.app for AI-powered help

---

**Built with ❤️ and Ferrari-grade design precision.**
