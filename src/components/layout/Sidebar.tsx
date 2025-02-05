import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, DollarSign, CreditCard, Calendar, PieChart } from "lucide-react";
import UserProfile from "./UserProfile";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transactions", href: "/transactions", icon: DollarSign },
  { name: "Accounts", href: "/accounts", icon: CreditCard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Reports", href: "/reports", icon: PieChart },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-primary">FinanceTracker</h1>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    location.pathname === item.href
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <UserProfile />
      </div>
    </div>
  );
};

export default Sidebar;