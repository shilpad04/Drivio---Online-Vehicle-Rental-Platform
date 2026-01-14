// OWNER ROUTES
export const OWNER_ROUTES = {
  DASHBOARD: "/dashboard/owner",

  VEHICLES: {
    ADD: "/dashboard/owner/vehicles/add",
    EDIT: (id) => `/dashboard/owner/vehicles/${id}/edit`,
    LIST: "/vehicles/my",
  },

  BOOKINGS: "/dashboard/owner/bookings",
  REVIEWS: "/dashboard/owner/reviews",
};

// ADMIN ROUTES
export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard/admin",

  USERS: {
    LIST: "/dashboard/admin/users",
    DETAILS: (id) => `/dashboard/admin/users/${id}`,
  },

  BOOKINGS: "/dashboard/admin/bookings",
  PAYMENTS: "/dashboard/admin/payments",
  REVIEWS: "/dashboard/admin/reviews",
  INQUIRIES: "/dashboard/admin/inquiries",
};

// RENTER ROUTES
export const RENTER_ROUTES = {
  DASHBOARD: "/dashboard/renter",

  BOOKINGS: "/dashboard/renter/bookings",
  PAYMENTS: "/dashboard/renter/payments",
  RENTALS: "/dashboard/renter/rentals",
};

// PUBLIC ROUTES
export const PUBLIC_ROUTES = {
  HOME: "/",
  VEHICLES: "/vehicles",
  VEHICLE_DETAILS: (id) => `/vehicles/${id}`,
  VEHICLE_AVAILABILITY: (id) => `/vehicles/${id}/availability`,
  HOW_IT_WORKS: "/how-it-works",
  ABOUT: "/about",
  CONTACT: "/contact",
  PROFILE: "/profile",
};
