export const redirectByRole = (user, navigate, context = "home") => {
  if (!user?.role) return;

  if (context === "dashboard") {
    if (user.role === "RENTER") navigate("/dashboard/renter");
    if (user.role === "OWNER") navigate("/dashboard/owner");
    if (user.role === "ADMIN") navigate("/dashboard/admin");
    return;
  }

  if (user.role === "RENTER") navigate("/");
  if (user.role === "OWNER") navigate("/dashboard/owner");
  if (user.role === "ADMIN") navigate("/dashboard/admin");
};
