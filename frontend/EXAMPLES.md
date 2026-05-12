# Code Examples - Porsche Admin Portal

This file provides common code examples for extending and customizing the admin portal.

---

## Component Examples

### Creating a Button with Ferrari Design

```tsx
// Primary Action Button
<button className="ferrari-btn-primary">
  Save Changes
</button>

// Secondary Action Button
<button className="ferrari-btn-secondary">
  Cancel
</button>

// Icon Button
<button className="ferrari-btn-primary flex items-center gap-2">
  <Plus size={18} />
  Add New
</button>

// Full-width Button
<button className="ferrari-btn-primary w-full">
  Complete Action
</button>
```

### Creating Cards

```tsx
// Light Card
<div className="ferrari-card">
  <h3 className="text-ferrari-subheading mb-4">Card Title</h3>
  <p className="text-ferrari-body">Card content goes here</p>
</div>

// Dark Card
<div className="ferrari-card-dark">
  <h3 className="text-ferrari-subheading text-white mb-4">Dark Card</h3>
  <p className="text-white/90">Dark mode content</p>
</div>

// Card with Image
<div className="ferrari-card overflow-hidden">
  <img 
    src="image.jpg" 
    alt="Preview"
    className="w-full h-48 object-cover"
  />
  <div className="p-6">
    <h3 className="text-ferrari-subheading">Title</h3>
  </div>
</div>
```

### Typography Examples

```tsx
// Main Heading
<h1 className="text-ferrari-heading">Page Title</h1>

// Subheading
<h2 className="text-ferrari-subheading">Section Title</h2>

// Body Text
<p className="text-ferrari-body">Regular paragraph text</p>

// Label
<label className="text-ferrari-label">Field Name</label>

// Statistic Value
<p className="text-ferrari-stat">2,847</p>

// Muted Text
<p className="text-[#8F8F8F] dark:text-[#D2D2D2]">Secondary info</p>
```

### Status Badges

```tsx
// Approved (Green)
<span className="px-3 py-1 bg-[#03904A]/10 text-[#03904A] 
  rounded-[2px] text-xs font-medium uppercase tracking-wider">
  Approved
</span>

// Pending (Yellow)
<span className="px-3 py-1 bg-[#F6E500]/10 text-[#F6E500] 
  rounded-[2px] text-xs font-medium uppercase tracking-wider">
  Pending
</span>

// Rejected (Red)
<span className="px-3 py-1 bg-[#F13A2C]/10 text-[#F13A2C] 
  rounded-[2px] text-xs font-medium uppercase tracking-wider">
  Rejected
</span>

// Custom Status Component
function StatusBadge({ status }: { status: string }) {
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

---

## Form Examples

### Input Field

```tsx
<div className="space-y-2">
  <label className="text-ferrari-label">Car Model</label>
  <input
    type="text"
    placeholder="e.g., Porsche 911 Carrera"
    className="w-full px-3 py-2 border border-[#D2D2D2] 
      rounded-[2px] text-black dark:text-white
      bg-white dark:bg-[#303030]
      focus:outline-none focus:border-[#DA291C]
      transition-colors"
  />
</div>
```

### Select Field

```tsx
<div className="space-y-2">
  <label className="text-ferrari-label">Status</label>
  <select
    className="w-full px-3 py-2 border border-[#D2D2D2] 
      rounded-[2px] text-black dark:text-white
      bg-white dark:bg-[#303030]
      focus:outline-none focus:border-[#DA291C]
      transition-colors"
  >
    <option value="available">Available</option>
    <option value="booked">Booked</option>
    <option value="maintenance">Maintenance</option>
  </select>
</div>
```

### Textarea Field

```tsx
<div className="space-y-2">
  <label className="text-ferrari-label">Notes</label>
  <textarea
    rows={4}
    placeholder="Enter admin notes..."
    className="w-full px-3 py-2 border border-[#D2D2D2] 
      rounded-[2px] text-black dark:text-white
      bg-white dark:bg-[#303030]
      focus:outline-none focus:border-[#DA291C]
      transition-colors resize-none"
  />
</div>
```

### Form Grid

```tsx
<div className="space-y-4">
  {/* Two Column Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="text-ferrari-label">First Name</label>
      <input type="text" className="w-full px-3 py-2 border..." />
    </div>
    <div>
      <label className="text-ferrari-label">Last Name</label>
      <input type="text" className="w-full px-3 py-2 border..." />
    </div>
  </div>

  {/* Three Column Layout */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="text-ferrari-label">Brand</label>
      <input type="text" className="w-full px-3 py-2 border..." />
    </div>
    <div>
      <label className="text-ferrari-label">Series</label>
      <input type="text" className="w-full px-3 py-2 border..." />
    </div>
    <div>
      <label className="text-ferrari-label">Model</label>
      <input type="text" className="w-full px-3 py-2 border..." />
    </div>
  </div>
</div>
```

---

## Layout Examples

### Two-Column Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {items.map((item) => (
    <div key={item.id} className="ferrari-card p-6">
      <h3 className="text-ferrari-subheading mb-4">{item.title}</h3>
      <p className="text-ferrari-body">{item.description}</p>
    </div>
  ))}
</div>
```

### Three-Column Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div key={item.id} className="ferrari-card overflow-hidden">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Four-Column Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat) => (
    <div key={stat.id} className="ferrari-card dark:ferrari-card-dark p-6">
      <p className="text-ferrari-label text-[#8F8F8F]">{stat.label}</p>
      <p className="text-ferrari-stat mt-2">{stat.value}</p>
    </div>
  ))}
</div>
```

---

## Data Table Examples

### Simple Table

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-[#D2D2D2] dark:border-[#303030]">
        <th className="text-left text-ferrari-label p-4">Name</th>
        <th className="text-left text-ferrari-label p-4">Email</th>
        <th className="text-left text-ferrari-label p-4">Status</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr
          key={item.id}
          className="border-b border-[#D2D2D2] dark:border-[#303030] 
            hover:bg-gray-50 dark:hover:bg-[#303030]"
        >
          <td className="p-4 text-ferrari-body">{item.name}</td>
          <td className="p-4 text-ferrari-body">{item.email}</td>
          <td className="p-4">
            <StatusBadge status={item.status} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Modal/Dialog Examples

### Simple Modal

```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-[#303030] rounded-[2px] p-8 w-full max-w-md">
      <h2 className="text-ferrari-subheading mb-6">Confirm Action</h2>
      <p className="text-ferrari-body mb-8">
        Are you sure you want to proceed?
      </p>
      <div className="flex gap-3">
        <button className="flex-1 ferrari-btn-primary">
          Confirm
        </button>
        <button className="flex-1 ferrari-btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
```

### Modal with Form

```tsx
{isOpen && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white dark:bg-[#303030] rounded-[2px] p-8 w-full max-w-2xl my-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-ferrari-subheading">Add New Item</h2>
        <button onClick={closeModal} className="p-2 hover:bg-gray-100">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields */}
        
        <div className="flex gap-3 mt-8">
          <button type="submit" className="flex-1 ferrari-btn-primary">
            Save
          </button>
          <button 
            type="button" 
            onClick={closeModal}
            className="flex-1 ferrari-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

---

## Chart Examples

### Custom Chart with Ferrari Colors

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const data = [
  { month: 'Jan', value: 100 },
  { month: 'Feb', value: 150 },
  { month: 'Mar', value: 120 },
]

export function MyChart() {
  return (
    <div className="ferrari-card p-6">
      <h3 className="text-ferrari-subheading mb-6">Trend Chart</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D2D2D2" />
          <XAxis dataKey="month" tick={{ fill: '#8F8F8F' }} />
          <YAxis tick={{ fill: '#8F8F8F' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #D2D2D2',
              borderRadius: '2px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#DA291C" 
            strokeWidth={2}
            dot={{ fill: '#DA291C', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

---

## Hook Examples

### useModal Custom Hook

```tsx
function useModal() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)

  return { isOpen, open, close, toggle }
}

// Usage
export default function MyComponent() {
  const modal = useModal()

  return (
    <>
      <button onClick={modal.open}>Open Modal</button>
      {modal.isOpen && <MyModal onClose={modal.close} />}
    </>
  )
}
```

### useAsync Custom Hook

```tsx
function useAsync(asyncFunction, immediate = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setLoading(true)
    try {
      const response = await asyncFunction()
      setData(response)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, loading, error, execute }
}
```

---

## API Integration Examples

### Fetch with Error Handling

```tsx
async function fetchData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// Usage in component
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchData('/api/cars')
    .then(setData)
    .catch(console.error)
    .finally(() => setLoading(false))
}, [])
```

### API POST Request

```tsx
async function createCar(carData: Car) {
  const response = await fetch('/api/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(carData),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create car')
  }
  
  return response.json()
}

// Usage
const handleCreate = async (formData) => {
  try {
    const newCar = await createCar(formData)
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

---

## Styling Patterns

### Hover States

```tsx
// Button hover
<button className="bg-white hover:bg-gray-50 transition-colors">
  Hover me
</button>

// Card hover
<div className="ferrari-card hover:shadow-lg transition-all cursor-pointer">
  Hover card
</div>

// Link hover
<a href="#" className="text-[#181818] hover:text-[#DA291C] transition-colors">
  Link text
</a>
```

### Responsive Visibility

```tsx
// Hide on mobile, show on tablet+
<div className="hidden md:block">
  Desktop only content
</div>

// Show on mobile, hide on tablet+
<div className="md:hidden">
  Mobile only content
</div>

// Different layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Responsive grid */}
</div>
```

### Dark Mode Utilities

```tsx
// Conditional dark mode styles
<div className="bg-white dark:bg-[#303030]">
  Adapts to dark mode
</div>

// Text color in dark mode
<p className="text-[#181818] dark:text-white">
  Readable in both modes
</p>

// Border color in dark mode
<div className="border border-[#D2D2D2] dark:border-[#303030]">
  Border adapts
</div>
```

---

## Best Practices

### ✅ Do's
- Use design token classes (`.ferrari-btn-primary`, `.text-ferrari-label`)
- Maintain 2px border-radius consistency
- Apply semantic colors for status indicators
- Use proper typography hierarchy
- Keep spacing consistent with 8px base unit
- Test dark mode for all components
- Use meaningful semantic HTML

### ❌ Don'ts
- Don't hardcode colors if they're in the token system
- Don't use rounded-full or large border-radius
- Don't scatter shadows everywhere
- Don't mix inconsistent typography sizes
- Don't forget dark mode support
- Don't use custom colors not in the palette
- Don't create single-use components

---

## Troubleshooting Common Issues

### Styles not applying?
```tsx
// Ensure class names are built dynamically
const getStatusClass = (status: string) => {
  return `bg-${status}-500 text-white` // Wrong!
}

// Correct - use full class names
const getStatusClass = (status: string) => {
  const classes = {
    approved: 'bg-[#03904A]/10 text-[#03904A]',
    pending: 'bg-[#F6E500]/10 text-[#F6E500]',
  }
  return classes[status] || classes.pending
}
```

### Dark mode not working?
```tsx
// Ensure parent has dark class
<html className="dark">
  <body>{children}</body>
</html>

// Then use dark: prefix
<div className="bg-white dark:bg-black">Content</div>
```

### Images breaking layout?
```tsx
// Always use object-fit and aspect-ratio
<img 
  src="url" 
  alt="Description"
  className="w-full h-48 object-cover"
/>

// Or use aspect-ratio
<div className="aspect-video">
  <img src="url" alt="Description" className="w-full h-full object-cover" />
</div>
```

---

For more examples, check the existing pages:
- `/app/admin/page.tsx` - Dashboard implementation
- `/app/admin/cars/page.tsx` - Car management CRUD
- `/app/admin/test-drives/page.tsx` - Test drive requests
