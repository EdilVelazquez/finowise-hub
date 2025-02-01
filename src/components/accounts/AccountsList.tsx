import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { AccountCard } from "./AccountCard";
import { AccountDetails } from "./AccountDetails";

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

  const calculateAccountBalance = (account: any) => {
    if (!transactions) return account.initial_balance || 0;
    
    const accountTransactions = transactions.filter(t => t.account_id === account.id);
    let balance = account.initial_balance || 0;

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

    return balance;
  };

  const getAccountTransactions = (accountId: string) => {
    if (!transactions) return [];
    return transactions.filter((t) => t.account_id === accountId);
  };

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

  const accountsWithCalculatedBalance = accounts?.map(account => ({
    ...account,
    calculated_balance: calculateAccountBalance(account)
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accountsWithCalculatedBalance?.map((account) => (
        <Dialog key={account.id}>
          <DialogTrigger asChild>
            <div>
              <AccountCard
                account={account}
                onEdit={() => {
                  setSelectedAccount(account);
                  setIsEditDialogOpen(true);
                }}
                onDelete={() => {
                  setSelectedAccount(account);
                  setIsDeleteDialogOpen(true);
                }}
                onClick={() => {}}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle de {account.name}</DialogTitle>
            </DialogHeader>
            <AccountDetails 
              account={account}
              transactions={getAccountTransactions(account.id)}
            />
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