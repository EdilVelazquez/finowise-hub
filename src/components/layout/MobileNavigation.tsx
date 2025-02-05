import { Link, useLocation } from "react-router-dom";
import { Home, DollarSign, CreditCard, Calendar, PieChart } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Transactions", href: "/transactions", icon: DollarSign },
  { name: "Accounts", href: "/accounts", icon: CreditCard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Reports", href: "/reports", icon: PieChart },
];

const MobileNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`p-4 flex flex-col items-center text-xs ${
                location.pathname === item.href
                  ? "text-primary"
                  : "text-gray-500 hover:text-primary"
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;