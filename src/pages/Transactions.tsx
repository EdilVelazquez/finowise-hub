
import { useState } from "react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { TransactionsFilter } from "@/components/transactions/TransactionsFilter";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Transactions = () => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [cloningTransaction, setCloningTransaction] = useState<any>(null);

  const handleTransactionSaved = () => {
    setOpen(false);
    setEditingTransaction(null);
    setCloningTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setCloningTransaction(null);
    setOpen(true);
  };

  const handleClone = (transaction: any) => {
    const clonedTransaction = {
      ...transaction,
      date: new Date().toISOString().split("T")[0],
    };
    setCloningTransaction(clonedTransaction);
    setEditingTransaction(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transacciones</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction
                  ? "Editar transacción"
                  : cloningTransaction
                  ? "Clonar transacción"
                  : "Nueva transacción"}
              </DialogTitle>
              <DialogDescription>
                {cloningTransaction
                  ? "Modifica la fecha y otros campos si lo deseas para crear una nueva transacción basada en la seleccionada."
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              onSuccess={handleTransactionSaved}
              initialData={editingTransaction || cloningTransaction}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 pb-0">
          <TransactionsFilter onFilterChange={setFilters} />
        </div>
        <div className="overflow-hidden">
          <TransactionsList
            onEdit={handleEdit}
            onClone={handleClone}
            filters={filters}
          />
        </div>
      </div>
    </div>
  );
};

export default Transactions;
