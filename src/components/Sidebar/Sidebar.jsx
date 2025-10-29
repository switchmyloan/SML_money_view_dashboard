import { X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import logo from "../../assets/rupyMoney.png";
import shortLogo from "../../assets/shortLogo.svg";
import {
  Home,
  Users,
  FileText,
  HelpCircle,
  Newspaper,
  MessageSquare,
  UserPlus,
  UserMinus,
  UserCheck,
  Building2,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Settings
} from "lucide-react";
import { routes } from "../../routes/routes";

const ICONS = {
  Home, FileText, Users, HelpCircle, Newspaper, MessageSquare,
  UserPlus,
  UserMinus,
  UserCheck,
  Building2,
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Settings
};

function Sidebar({ onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroup, setOpenGroup] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const buttonRefs = useRef({});
  const sidebarRef = useRef(null);

  // Close dropdown if location is not inside the group's children
  useEffect(() => {
    const currentRoute = routes.find((r) => r.path === location.pathname);
    if (currentRoute?.group) {
      setOpenGroup(currentRoute.group);
    } else {
      setOpenGroup(null);
    }
  }, [location.pathname]);

  // Group routes
  const groupedRoutes = routes
    .filter((r) => r.showInSidebar)
    .reduce((acc, route) => {
      if (route.group) {
        if (!acc[route.group]) acc[route.group] = { order: route.groupOrder, items: [] };
        acc[route.group].items.push(route);
      } else {
        acc[route.label] = route;
      }
      return acc;
    }, {});

  // Sort parent and children
  const sortedGroupedRoutes = Object.entries(groupedRoutes)
    .sort(([keyA, valueA], [keyB, valueB]) => {
      const orderA = valueA.items ? valueA.order : valueA.order;
      const orderB = valueB.items ? valueB.order : valueB.order;
      return orderA - orderB;
    })
    .map(([key, value]) => {
      if (value.items) {
        return [key, value.items.sort((a, b) => a.order - b.order)];
      }
      return [key, value];
    });

  // Handle dropdown toggle and data
  // const handleGroupClick = (groupName, items) => {
  //   if (items.length > 0) {
  //     navigate(items[0].path); 
  //   }
  //   if (collapsed) {
  //     setDropdownData({ groupName, items, key: groupName });
  //   } else {
  //     setOpenGroup(openGroup === groupName ? null : groupName);
  //   }
  // };

  const handleGroupClick = (groupName, items) => {
    if (collapsed) {
      // Collapsed state -> show dropdown menu only
      setDropdownData({ groupName, items, key: groupName });
    } else {
      if (openGroup === groupName) {
        // Agar already open hai -> bas band karo
        setOpenGroup(null);
      } else {
        // Agar open nahi hai -> open karo + first child pe le jao
        setOpenGroup(groupName);
        if (items.length > 0) {
          navigate(items[0].path);
        }
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownData && !event.target.closest('.sidebar') && !event.target.closest('.dropdown-menu')) {
        setDropdownData(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownData]);

  // Get the ref for the clicked button
  const getClickedButtonRef = () => {
    if (dropdownData && buttonRefs.current[dropdownData.key]) {
      return buttonRefs.current[dropdownData.key];
    }
    return null;
  };

  return (
    <div
      ref={sidebarRef}
      className={`h-full bg-white text-gray-700 flex flex-col shadow-lg transition-all duration-300 ${collapsed ? "w-20" : "w-64"
        } relative sidebar`}
    >
      {/* Header */}
      <div className="p-[15px] flex justify-between items-center border-b border-gray-200 bg-black">
        {!collapsed ? (
          <img src={logo} alt="Logo" className="w-28 h-auto bg-black" />
        ) : (
          <img src={logo} alt="Logo" className="w-5 h-auto" />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="text-gray-500 hover:text-primary"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          </button>
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-primary"
            title="Close Sidebar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <ul className="mt-6 flex-1 px-3 overflow-y-auto">
        {sortedGroupedRoutes.map(([key, value]) => {
          if (Array.isArray(value)) {
            // Group (Dropdown)
            const groupIcon = ICONS[value[0].icon] || HelpCircle;
            const itemCount = value.length;
            return (
              <li key={key} className="mb-2 relative">
                <button
                  ref={(el) => (buttonRefs.current[key] = el)}
                  onClick={() => handleGroupClick(key, value)}
                  // className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition-all duration-200 font-medium ${
                  //   openGroup === key && !collapsed
                  //     ? "bg-gray-600 text-white shadow"
                  //     : "text-gray-600 hover:bg-gray-200 hover:text-black"
                  // }`}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition-all duration-200 font-semibold ${openGroup === key && !collapsed
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  title={collapsed ? `${key} (${itemCount})` : ""}
                >
                  <div className="flex items-center gap-2">
                    {groupIcon && React.createElement(groupIcon, { size: 16 })}
                    {collapsed ? null : key}
                  </div>
                  {!collapsed && <ChevronDown size={16} />}
                </button>

                {openGroup === key && !collapsed && (
                  <ul className="ml-2 mt-1 space-y-1">
                    {value.map((route) => {
                      const SubIcon = ICONS[route.icon] || HelpCircle;
                      return (
                        <li key={route.path}>
                          <NavLink
                            to={route.path}
                            // className={({ isActive }) =>
                            //   `flex items-center gap-3 px-3 py-1.5 rounded-md text-sm ${
                            //     isActive
                            //       ? "bg-primary text-white"
                            //       : "text-gray-600 hover:bg-gray-200 hover:text-black"
                            //   }`
                            // }
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${isActive
                                ? "bg-purple-600 text-white shadow-sm"
                                : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                              }`
                            }
                          >
                            <SubIcon size={16} />
                            {route.label}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          } else {
            // Single (Non-grouped)
            const Icon = ICONS[value.icon] || HelpCircle;
            return (
              <li key={value.path} className="mb-2">
                <NavLink
                  to={value.path}
                  end={value.path === "/"}
                  // className={({ isActive }) =>
                  //   `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  //     isActive
                  //       ? "bg-primary text-white shadow"
                  //       : "text-gray-600 hover:bg-gray-200 hover:text-black"
                  //   }`
                  // }
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${isActive
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    }`
                  }
                  title={collapsed ? value.label : ""}
                >
                  {Icon && <Icon size={18} />}
                  {!collapsed && value.label}
                </NavLink>
              </li>
            );
          }
        })}
      </ul>

      {/* {!collapsed && (
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200">
          © 2025 Cready CMS
        </div>
      )} */}

      {/* Dropdown Menu */}
      {dropdownData && collapsed && sidebarRef.current && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-2 dropdown-menu z-10"
          style={{
            top: getClickedButtonRef()?.getBoundingClientRect().top - sidebarRef.current.getBoundingClientRect().top + sidebarRef.current.scrollTop,
            left: getClickedButtonRef()?.offsetWidth + 5 || 0,
            width: '200px',
          }}
        >
          <h4 className="font-medium text-gray-700 mb-2">{dropdownData.groupName}</h4>
          <ul>
            {dropdownData.items.map((route) => {
              const SubIcon = ICONS[route.icon] || HelpCircle;
              return (
                <li key={route.path} className="mb-1">
                  <NavLink
                    to={route.path}
                    // className={({ isActive }) =>
                    //   `flex items-center gap-2 px-2 py-1 rounded-md text-sm ${
                    //     isActive
                    //       ? "bg-primary text-white"
                    //       : "text-gray-600 hover:bg-gray-200 hover:text-black"
                    //   }`
                    // }
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors duration-200 ${isActive
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                      }`
                    }
                    onClick={() => setDropdownData(null)}
                  >
                    <SubIcon size={16} />
                    {route.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Sidebar; 