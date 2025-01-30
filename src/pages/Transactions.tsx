import { useState } from "react";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { TransactionsFilter } from "@/components/transactions/TransactionsFilter";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Transactions = () => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleTransactionSaved = () => {
    setOpen(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
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
                {editingTransaction ? "Editar" : "Nueva"} transacción
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSuccess={handleTransactionSaved}
              initialData={editingTransaction}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TransactionsFilter onFilterChange={setFilters} />
        <TransactionsList onEdit={handleEdit} filters={filters} />
      </div>
    </div>
  );
};

export default Transactions;