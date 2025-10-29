import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { routes } from "@routes/routes";

export default function Breadcrumb() {
  const location = useLocation();
  const pathname = location.pathname;

  // Find current route with fallback
  const currentRoute = routes.find((r) => r.path === pathname);

  // Generate crumbs
  const crumbs = [];
  if (currentRoute) {
    if (currentRoute.group) {
      const groupRoutes = routes
        .filter((r) => r.group === currentRoute.group)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const firstChild = groupRoutes[0];
      if (firstChild) {
        crumbs.push({
          name: currentRoute.group,
          href: firstChild.path,
        });
      }
      crumbs.push({ name: currentRoute.label, href: pathname });
    } else {
      crumbs.push({ name: currentRoute.label, href: pathname });
    }
  } else {
    // Handle dynamic routes like /lead-detail/:id
    const pathSegments = pathname.split("/").filter((segment) => segment);
    let currentPath = "";

    if (pathSegments[0] === "lead-detail" && pathSegments.length > 1) {
      // ✅ Always show "Lead" as parent for lead details
      crumbs.push({
        name: "Logs",
        href: "/logs", // or "/lead-management" if that's your listing page
      });
      crumbs.push({
        name: `Log Detail ${pathSegments[1]}`,
        href: null, // current page, not clickable
      });
    } else {
      // Default handling for other routes
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        crumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: index === pathSegments.length - 1 ? null : currentPath,
        });
      });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm bg-white px-4 py-2 shadow-sm border border-gray-100 pt-4"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="flex items-center px-2 py-1 rounded-md text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
          </Link>
        </li>

        {crumbs.length > 0 ? (
          crumbs.map((page, idx) => (
            <li key={`${page.name}-${idx}`} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
              {page.href ? (
                <Link
                  to={page.href}
                  className={`ml-1 ${
                    idx === crumbs.length - 1
                      ? "font-semibold text-primary"
                      : "text-gray-600 hover:text-primary"
                  } transition-colors`}
                >
                  {page.name}
                </Link>
              ) : (
                <span className="ml-1 font-semibold text-gray-800">
                  {page.name}
                </span>
              )}
            </li>
          ))
        ) : (
          <li className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="ml-1 font-semibold text-gray-800">Not Found</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
