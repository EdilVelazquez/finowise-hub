
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense' | 'payment' | 'credit';
  date: string;
  account_id: string;
  description: string | null;
}

interface Account {
  id: string;
  name: string;
  is_current_account: boolean;
  payment_type: string;
  initial_balance: number;
  balance: number;
  type: string;
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

  const calculateTotalBalance = () => {
    if (!accounts) return 0;
    return accounts.reduce((total, account) => total + (account.balance || 0), 0);
  };

  const getRecentTransactions = () => {
    if (!transactions) return [];
    return transactions.slice(0, 5);
  };

  const monthlyBalance = transactions && accounts ? calculateMonthlyBalance(transactions) : {};
  const isLoading = isLoadingTransactions || isLoadingAccounts;
  const totalBalance = calculateTotalBalance();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* Total Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Total</CardTitle>
              <CardDescription>Balance actual de todas las cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </p>
            </CardContent>
          </Card>

          {/* Accounts Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Cuentas</CardTitle>
              <CardDescription>Estado actual de todas tus cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts?.map((account) => (
                  <Card key={account.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <CardDescription>{account.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-xl font-semibold ${(account.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(account.balance || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>Últimas 5 transacciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell className={`text-right ${
                        transaction.type === 'income' || transaction.type === 'payment' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Monthly Balance */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Mensual</CardTitle>
              <CardDescription>Resumen de ingresos y gastos por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Object.entries(monthlyBalance).map(([month, balance]) => (
                  <li key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium">{month}</span>
                    <span className={`${balance >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
