import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CalendarDays,
  BarChart3,
  List
} from "lucide-react";
import UserProfile from "./UserProfile";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cuentas", href: "/accounts", icon: Wallet },
  { name: "Transacciones", href: "/transactions", icon: ArrowLeftRight },
  { name: "Categorías", href: "/categories", icon: List },
  { name: "Calendario", href: "/calendar", icon: CalendarDays },
  { name: "Reportes", href: "/reports", icon: BarChart3 },
];

const Sidebar = () => {
  return (
    <div className="fixed inset-y-0 z-50 flex flex-col md:w-64">
      {/* Sidebar content */}
      <div className="flex flex-col flex-grow overflow-y-auto border-r border-gray-200 bg-white pt-5">
        <div className="flex-shrink-0 px-4">
          {/* Logo or branding */}
          <span className="font-bold text-xl">Finowise Hub</span>
        </div>
        <nav className="flex-1 space-y-1 bg-white px-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-gray-900",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                )
              }
            >
              <item.icon
                className={cn(
                  "mr-3 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500",
                  item.current && "text-gray-500"
                )}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
        {/* User profile section */}
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;
