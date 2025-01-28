import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export function AccountsList() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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
      return data;
    },
  });

  if (isLoading) {
    return <div>Cargando cuentas...</div>;
  }

  const getAccountTypeLabel = (type: string) => {
    const types = {
      checking: "Cuenta corriente",
      savings: "Cuenta de ahorros",
      credit: "Tarjeta de crédito",
      debit: "Tarjeta de débito",
      cash: "Efectivo",
    };
    return types[type as keyof typeof types] || type;
  };

  const getPaymentTypeLabel = (type: string | null) => {
    if (!type) return null;
    return type === "receivable" ? "Cuenta por cobrar" : "Cuenta por pagar";
  };

  const getAccountTransactions = (accountId: string) => {
    return transactions?.filter((t) => t.account_id === accountId) || [];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts?.map((account) => (
        <Dialog key={account.id}>
          <DialogTrigger asChild>
            <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                  <span className="text-lg">{account.name}</span>
                  <span 
                    className={`text-xl ${account.balance < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {formatCurrency(account.balance)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Tipo: {getAccountTypeLabel(account.type)}</p>
                  {account.is_current_account && (
                    <p>Tipo de cuenta corriente: {getPaymentTypeLabel(account.payment_type)}</p>
                  )}
                  {account.credit_limit && (
                    <p>Límite de crédito: {formatCurrency(account.credit_limit)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle de {account.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo de cuenta</p>
                    <p className="font-medium">{getAccountTypeLabel(account.type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Saldo actual</p>
                    <p className={`font-medium ${account.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  {account.is_current_account && (
                    <div>
                      <p className="text-sm text-gray-500">Tipo de cuenta corriente</p>
                      <p className="font-medium">{getPaymentTypeLabel(account.payment_type)}</p>
                    </div>
                  )}
                  {account.credit_limit && (
                    <div>
                      <p className="text-sm text-gray-500">Límite de crédito</p>
                      <p className="font-medium">{formatCurrency(account.credit_limit)}</p>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="font-medium mb-2">Transacciones recientes</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {getAccountTransactions(account.id).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-3 rounded bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.date), "dd/MM/yyyy")} - {transaction.category?.name}
                      </p>
                    </div>
                    <span
                      className={
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
                {getAccountTransactions(account.id).length === 0 && (
                  <p className="text-center text-gray-500">No hay transacciones</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
      {accounts?.length === 0 && (
        <div className="col-span-full text-center text-gray-500">
          No hay cuentas creadas
        </div>
      )}
    </div>
  );
}