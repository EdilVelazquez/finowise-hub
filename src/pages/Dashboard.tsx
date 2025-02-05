import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las transacciones.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const calculateMonthlyBalance = (transactions: any[]) => {
    return transactions.reduce((acc: { [key: string]: number }, transaction: any) => {
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

  const monthlyBalance = calculateMonthlyBalance(transactions);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {loading ? (
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
