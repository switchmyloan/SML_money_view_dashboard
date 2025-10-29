export const routes = [
  // --- Non-grouped ---
  {
    path: "/",
    label: "Dashboard",
    icon: "Home",
    showInSidebar: false,
    order: 0,
  },

 
  {
    path: "/logs",
    label: "Logs",
    icon: "ClipboardList", // ✅ leads list
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1, 
    order: 2,
  }
];
