# Backend Integration Guide

This document outlines the backend API endpoints and integration steps for the AutoFlow IMS frontend.

## API Endpoints Required

### 1. User Profile & Authentication

#### Get User Profile
```
GET /api/user/profile
Authorization: Bearer {token}
Response: {
  id: number,
  name: string,
  email: string,
  role: "CUSTOMER",
  phoneNumber: string
}
```

**Integration Location:** `src/components/Navbar.tsx` line 11

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {token}
```
**Integration Location:** `src/components/Navbar.tsx` line 20

---

### 2. Dashboard Data

#### Get Appointment Status Counts
```
GET /api/appointments/stats
Authorization: Bearer {token}
Response: {
  scheduled: number,
  inProgress: number,
  completed: number,
  cancelled: number
}
```

**Integration Location:** `src/app/Dashboard/page.tsx` line 6

#### Get Upcoming Appointments
```
GET /api/appointments/upcoming?limit=10
Authorization: Bearer {token}
Response: [{
  id: string,
  vehicle: string,
  vehicleId: number,
  service: string,
  serviceId: number,
  date: string,
  time: string,
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  employeeId: number,
  employee: string,
  estimatedDuration: number
}]
```

**Integration Location:** `src/app/Dashboard/page.tsx` line 7

---

### 3. Vehicles Management

#### Get User's Vehicles
```
GET /api/vehicles
Authorization: Bearer {token}
Response: [{
  id: number,
  userId: number,
  make: string,
  model: string,
  year: string,
  plate: string,
  vin: string,
  color: string,
  isDefault: boolean
}]
```

**Integration Location:** `src/app/Dashboard/page.tsx` line 8

#### Add New Vehicle
```
POST /api/vehicles
Authorization: Bearer {token}
Body: {
  make: string,
  model: string,
  year: string,
  plate: string,
  color: string,
  vin?: string
}
Response: {
  id: number,
  ...vehicle data
}
```

#### Update Vehicle
```
PUT /api/vehicles/{id}
Authorization: Bearer {token}
Body: { ...update fields }
```

#### Delete Vehicle
```
DELETE /api/vehicles/{id}
Authorization: Bearer {token}
```

---

### 4. Appointments

#### Get All Appointments
```
GET /api/appointments?status=SCHEDULED&status=IN_PROGRESS
Authorization: Bearer {token}
```

#### Get Single Appointment
```
GET /api/appointments/{id}
Authorization: Bearer {token}
Response: {
  id: string,
  vehicle: { ...vehicle data },
  service: { ...service data },
  date: string,
  time: string,
  status: string,
  employee: { ...employee data },
  notes: string[],
  estimatedDuration: number,
  actualDuration: number,
  totalCost: number,
  createdAt: string,
  updatedAt: string
}
```

#### Create Appointment
```
POST /api/appointments
Authorization: Bearer {token}
Body: {
  vehicleId: number,
  serviceId: number,
  date: string,
  time: string,
  customService?: string,
  notes?: string
}
Response: { ...appointment data }
```

#### Update Appointment Status
```
PATCH /api/appointments/{id}/status
Authorization: Bearer {token}
Body: {
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}
```

---

### 5. Services

#### Get Available Services
```
GET /api/services
Authorization: Bearer {token}
Response: [{
  id: number,
  name: string,
  description: string,
  category: string,
  estimatedDuration: number,
  price: number
}]
```

#### Get Available Time Slots
```
GET /api/slots/available?date=2024-12-20
Authorization: Bearer {token}
Response: {
  date: string,
  slots: [{
    time: string,
    available: boolean,
    employeeId?: number
  }]
}
```

---

### 6. Notifications

#### Get Notifications
```
GET /api/notifications
Authorization: Bearer {token}
Response: [{
  id: number,
  type: "APPOINTMENT_CONFIRMED" | "STATUS_CHANGED" | "REMINDER",
  title: string,
  message: string,
  read: boolean,
  appointmentId?: string,
  createdAt: string
}]
```

#### Mark Notification as Read
```
PATCH /api/notifications/{id}/read
Authorization: Bearer {token}
```

---

### 7. Service History & Feedback

#### Get Service History
```
GET /api/history?vehicleId=1&limit=50
Authorization: Bearer {token}
Response: [{
  appointmentId: string,
  vehicle: string,
  service: string,
  date: string,
  status: string,
  rating?: number,
  cost: number
}]
```

#### Submit Feedback
```
POST /api/feedback
Authorization: Bearer {token}
Body: {
  appointmentId: string,
  overallRating: number,
  qualityRating: number,
  communicationRating: number,
  timelinessRating: number,
  cleanlinessRating: number,
  feedbackText: string,
  photos?: File[]
}
Response: { id: number, ...feedback data }
```

---

## Implementation Steps

1. **Update API Configuration**
   - File: `src/app/api/api.tsx`
   - Add authentication header to all requests
   - Add error handling

2. **Replace Mock Data**
   - Search for "Mock Data" comments in code
   - Replace with API calls using `api.get()`, `api.post()`, etc.

3. **Add Loading States**
   - Show skeleton loaders while fetching data
   - Handle loading errors gracefully

4. **Add Real-time Updates**
   - Implement WebSocket connection for live status updates
   - Or use polling every 30 seconds

5. **Add Error Boundaries**
   - Handle network errors
   - Show user-friendly error messages

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (redirect to login)
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Testing with Mock Data

Currently using mock data in:
- `src/app/Dashboard/page.tsx`
- `src/components/Navbar.tsx`

To test with real backend:
1. Update `src/app/api/api.tsx` to add auth headers
2. Replace useState mock data with useEffect API calls
3. Add error handling and loading states
4. Test each endpoint individually

