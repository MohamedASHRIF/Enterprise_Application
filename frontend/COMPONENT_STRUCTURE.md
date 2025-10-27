# Component Structure - AutoFlow IMS

## ✅ Component Organization

All components are now properly organized with clear, understandable names instead of generic `page.tsx`.

## 📁 Directory Structure

```
frontend/src/
├── components/
│   ├── Navbar.tsx                           # Main navigation bar
│   ├── vehicles/
│   │   ├── VehicleList.tsx                  # Displays grid of vehicle cards
│   │   └── VehicleStats.tsx                 # Vehicle statistics cards
│   └── booking/
│       ├── VehicleSelection.tsx             # Vehicle selection component
│       ├── ServiceSelection.tsx             # Service selection grid
│       └── BookingSummary.tsx               # Sidebar booking summary
│
├── app/
│   ├── page.tsx                             # Login page
│   ├── Register/
│   │   └── page.tsx                         # Registration page
│   ├── Dashboard/
│   │   ├── page.tsx                         # Main dashboard
│   │   ├── vehicles/
│   │   │   ├── page.tsx                     # Vehicle list page
│   │   │   └── add/
│   │   │       └── page.tsx                 # Add vehicle form
│   │   └── book-service/
│   │       ├── page.tsx                     # Service selection (Step 1)
│   │       ├── slots/
│   │       │   └── page.tsx                 # Time slot selection (Step 2)
│   │       └── confirm/
│   │           └── page.tsx                 # Confirmation (Step 3)
```

## 🎯 Component Responsibilities

### **Navbar.tsx**
- User profile dropdown
- Navigation links
- Notifications
- Logout functionality

### **VehicleList.tsx**
- Displays vehicle cards in grid
- Shows default badge for active vehicle
- Handles empty state
- Edit/Delete actions

### **VehicleStats.tsx**
- Total vehicles count
- Active vehicles count
- Default vehicle display

### **VehicleSelection.tsx**
- Renders vehicle selection cards
- Shows selected state
- Vehicle information display

### **ServiceSelection.tsx**
- Displays service grid
- Shows service details (duration, price)
- Handles service selection

### **BookingSummary.tsx**
- Sidebar summary component
- Shows vehicle, service, date/time
- Reusable across all booking steps

## 🔄 Page Structure

### Vehicles
- **page.tsx** - Main page that imports:
  - VehicleStats component
  - VehicleList component
  - Manages state and handlers

### Booking
- **page.tsx** (Step 1) - Service selection
- **slots/page.tsx** (Step 2) - Time slot picker
- **confirm/page.tsx** (Step 3) - Final confirmation

## 💡 Benefits

✅ **Clear naming** - Easy to find and understand components  
✅ **Reusable** - Components can be used in multiple pages  
✅ **Maintainable** - Each component has single responsibility  
✅ **Scalable** - Easy to add new features  
✅ **Clean code** - Separation of concerns  

## 🎨 Design Consistency

All components share:
- Dark theme (gray-900/gray-950)
- Cyan/blue gradient accents
- Rounded-xl borders
- Shadow effects
- Hover transitions
- Responsive layouts

