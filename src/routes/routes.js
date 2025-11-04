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
    icon: "ClipboardList", 
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1, 
    order: 2,
  },
  {
    path: "/business-loans",
    label: "Business Loans",
    icon: "ClipboardList", 
    showInSidebar: true,
    group: "Lead Management",
    groupOrder: 1, 
    order: 2,
  }
];
