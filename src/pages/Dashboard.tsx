
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'payment' | 'credit';
  date: string;
}

const Dashboard = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Transaction[];
    },
  });

  const calculateMonthlyBalance = (transactions: Transaction[]) => {
    return transactions.reduce((acc: { [key: string]: number }, transaction) => {
      const monthKey = format(new Date(transaction.date), 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      
      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        acc[monthKey] += amount;
      } else if (transaction.type === 'expense') {
        acc[monthKey] -= amount;
      }
      
      return acc;
    }, {});
  };

  const monthlyBalance = transactions ? calculateMonthlyBalance(transactions) : {};

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <h2 className="text-xl mt-4">Balance Mensual</h2>
          <ul>
            {Object.entries(monthlyBalance).map(([month, balance]) => (
              <li key={month}>
                {month}: {balance.toFixed(2)} COP
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
