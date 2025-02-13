
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'payment' | 'credit';
  date: string;
  account_id: string;
}

interface Account {
  id: string;
  is_current_account: boolean;
  payment_type: string;
  initial_balance: number;
}

const Dashboard = () => {
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as Transaction[];
    },
  });

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*");

      if (error) throw error;
      return (data || []) as Account[];
    },
  });

  const calculateMonthlyBalance = (transactions: Transaction[]) => {
    return transactions.reduce((acc: { [key: string]: number }, transaction) => {
      const monthKey = format(new Date(transaction.date), 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      
      const account = accounts?.find(a => a.id === transaction.account_id);
      const amount = Number(transaction.amount);

      if (account?.is_current_account) {
        if (account.payment_type === "receivable") {
          acc[monthKey] += transaction.type === "payment" ? -amount : amount;
        } else {
          acc[monthKey] += transaction.type === "payment" ? amount : -amount;
        }
      } else {
        if (transaction.type === "income") {
          acc[monthKey] += amount;
        } else if (transaction.type === "expense") {
          acc[monthKey] -= amount;
        } else if (transaction.type === "payment") {
          acc[monthKey] += amount;
        } else if (transaction.type === "credit") {
          acc[monthKey] -= amount;
        }
      }
      
      return acc;
    }, {});
  };

  const monthlyBalance = transactions && accounts ? calculateMonthlyBalance(transactions) : {};
  const isLoading = isLoadingTransactions || isLoadingAccounts;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <h2 className="text-xl mt-4">Balance Mensual</h2>
          <ul className="space-y-2">
            {Object.entries(monthlyBalance).map(([month, balance]) => (
              <li key={month} className="flex justify-between items-center p-2 bg-white rounded-lg shadow">
                <span className="font-medium">{month}</span>
                <span className={`${balance >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                  {balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
