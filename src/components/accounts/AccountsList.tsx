import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { AccountForm } from "./AccountForm";

export function AccountsList() {
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const handleDeleteAccount = async () => {
    try {
      const accountTransactions = transactions?.filter(
        (t) => t.account_id === selectedAccount.id
      );

      if (accountTransactions && accountTransactions.length > 0) {
        const { error: transactionsError } = await supabase
          .from("transactions")
          .delete()
          .eq("account_id", selectedAccount.id);

        if (transactionsError) throw transactionsError;
      }

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", selectedAccount.id);

      if (error) throw error;

      toast.success("Cuenta eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      toast.error("Error al eliminar la cuenta");
    }
  };

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts?.map((account) => (
        <Dialog key={account.id}>
          <DialogTrigger asChild>
            <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-lg">{account.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccount(account);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccount(account);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Saldo inicial</div>
                    <div className="text-base">
                      {formatCurrency(account.initial_balance)}
                    </div>
                    <div className="text-sm text-gray-500">Saldo actual</div>
                    <div 
                      className={`text-xl ${account.balance < 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatCurrency(account.balance)}
                    </div>
                  </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cuenta</DialogTitle>
          </DialogHeader>
          <AccountForm 
            initialData={selectedAccount} 
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setSelectedAccount(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la cuenta y todas sus transacciones asociadas. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
