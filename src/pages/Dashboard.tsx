import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

const Dashboard = () => {
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          category:categories(name, type)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const calculateTotalBalance = () => {
    if (!accounts || !transactions) return 0;
    return accounts.reduce((total, account) => {
      let balance = account.initial_balance || 0;
      const accountTransactions = transactions.filter(t => t.account_id === account.id);
      
      accountTransactions.forEach(transaction => {
        if (account.is_current_account) {
          if (account.payment_type === "receivable") {
            balance += transaction.type === "payment" ? -transaction.amount : transaction.amount;
          } else {
            balance += transaction.type === "payment" ? transaction.amount : -transaction.amount;
          }
        } else {
          balance += transaction.type === "income" ? transaction.amount : -transaction.amount;
        }
      });
      
      return total + balance;
    }, 0);
  };

  const calculateMonthlyIncome = () => {
    if (!transactions) return 0;
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && 
               transactionDate <= endDate && 
               t.type === "income";
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateMonthlyExpenses = () => {
    if (!transactions) return 0;
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && 
               transactionDate <= endDate && 
               t.type === "expense";
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateCreditCardDue = () => {
    if (!accounts || !transactions) return 0;
    const creditCards = accounts.filter(a => a.type === "credit");
    return creditCards.reduce((total, card) => {
      const cardTransactions = transactions.filter(t => t.account_id === card.id);
      const balance = cardTransactions.reduce((sum, t) => 
        sum + (t.type === "expense" ? t.amount : -t.amount), 0);
      return total + balance;
    }, 0);
  };

  const getLastSixMonthsData = () => {
    if (!transactions) return [];
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const currentMonth = subMonths(new Date(), i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        name: format(currentMonth, "MMM"),
        income,
        expenses
      });
    }
    return monthlyData;
  };

  const getCategoryData = () => {
    if (!transactions) return [];
    
    const categoryTotals = transactions.reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || "Sin categoría";
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += transaction.type === "expense" ? transaction.amount : 0;
      return acc;
    }, {});

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter(category => category.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Balance Total</p>
              <p className="text-lg font-semibold">{formatCurrency(calculateTotalBalance())}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Ingresos del Mes</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(calculateMonthlyIncome())}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Gastos del Mes</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(calculateMonthlyExpenses())}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Deuda Tarjetas</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(calculateCreditCardDue())}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ingresos vs Gastos (Últimos 6 meses)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getLastSixMonthsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{ color: 'black' }}
                />
                <Legend />
                <Bar dataKey="income" name="Ingresos" fill="#059669" />
                <Bar dataKey="expenses" name="Gastos" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Gastos por Categoría</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;