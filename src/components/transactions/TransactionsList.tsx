
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  account: { name: string };
  category: { name: string };
  account_id: string;
  category_id: string;
}

interface TransactionsListProps {
  onEdit: (transaction: Transaction) => void;
  onClone: (transaction: Transaction) => void;
  filters: {
    account_id?: string;
    category_id?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function TransactionsList({ onEdit, onClone, filters }: TransactionsListProps) {
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select(`
          *,
          account:accounts(name),
          category:categories(name)
        `)
        .order("date", { ascending: false });

      if (filters.account_id) {
        query = query.eq("account_id", filters.account_id);
      }
      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.startDate) {
        query = query.gte("date", filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte("date", filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Transacción eliminada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    } catch (error) {
      console.error("Error al eliminar la transacción:", error);
      toast.error("Error al eliminar la transacción");
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Ingreso";
      case "expense":
        return "Gasto";
      case "payment":
        return "Pago";
      case "credit":
        return "Abono";
      default:
        return type;
    }
  };

  const startEditing = (transaction: Transaction, field: string) => {
    setEditingCell({ id: transaction.id, field });
    setEditValue(field === 'amount' ? transaction.amount.toString() : transaction[field as keyof Transaction] as string);
  };

  const saveEdit = async (id: string, field: string) => {
    try {
      let value = editValue;
      
      // Format value based on field type
      if (field === 'amount') {
        value = parseFloat(editValue).toString();
        if (isNaN(parseFloat(value))) {
          toast.error("El monto debe ser un número válido");
          return;
        }
      }
      
      const { error } = await supabase
        .from("transactions")
        .update({ [field]: value })
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Transacción actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setEditingCell(null);
    } catch (error) {
      console.error("Error al actualizar la transacción:", error);
      toast.error("Error al actualizar la transacción");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: string) => {
    if (e.key === 'Enter') {
      saveEdit(id, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando transacciones...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse">
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow className="border-b border-gray-200">
            <TableHead className="font-semibold text-gray-700 py-3">Fecha</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">Descripción</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">Cuenta</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">Categoría</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">Tipo</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 text-right">Monto</TableHead>
            <TableHead className="font-semibold text-gray-700 py-3 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow 
              key={transaction.id}
              className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
            >
              <TableCell className="py-2">
                {format(new Date(transaction.date), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="py-2">
                {editingCell?.id === transaction.id && editingCell?.field === 'description' ? (
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(transaction.id, 'description')}
                    onKeyDown={(e) => handleKeyDown(e, transaction.id, 'description')}
                    className="h-8 min-w-[160px]"
                  />
                ) : (
                  <div
                    className="cursor-pointer hover:bg-blue-100 py-1 px-2 rounded-md"
                    onClick={() => startEditing(transaction, 'description')}
                  >
                    {transaction.description}
                  </div>
                )}
              </TableCell>
              <TableCell className="py-2">{transaction.account?.name}</TableCell>
              <TableCell className="py-2">{transaction.category?.name}</TableCell>
              <TableCell className="py-2">{getTransactionTypeLabel(transaction.type)}</TableCell>
              <TableCell className="py-2 text-right">
                {editingCell?.id === transaction.id && editingCell?.field === 'amount' ? (
                  <Input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(transaction.id, 'amount')}
                    onKeyDown={(e) => handleKeyDown(e, transaction.id, 'amount')}
                    className="h-8 max-w-[120px] ml-auto"
                    type="number"
                    step="0.01"
                  />
                ) : (
                  <div
                    className={`cursor-pointer hover:bg-blue-100 py-1 px-2 rounded-md inline-block ${
                      transaction.type === "income" || transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                    onClick={() => startEditing(transaction, 'amount')}
                  >
                    {formatCurrency(transaction.amount)}
                  </div>
                )}
              </TableCell>
              <TableCell className="py-2 text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onClone(transaction)}
                  title="Clonar transacción"
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(transaction)}
                  title="Editar transacción"
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction.id)}
                  title="Eliminar transacción"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {transactions?.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No hay transacciones registradas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
