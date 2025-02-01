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
import { Copy, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

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

  if (isLoading) {
    return <div>Cargando transacciones...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Cuenta</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions?.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {format(new Date(transaction.date), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>{transaction.account?.name}</TableCell>
            <TableCell>{transaction.category?.name}</TableCell>
            <TableCell>{getTransactionTypeLabel(transaction.type)}</TableCell>
            <TableCell className="text-right">
              <span
                className={
                  transaction.type === "income" || transaction.type === "credit"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {formatCurrency(transaction.amount)}
              </span>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onClone(transaction)}
                title="Clonar transacción"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(transaction)}
                title="Editar transacción"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(transaction.id)}
                title="Eliminar transacción"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {transactions?.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center">
              No hay transacciones registradas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}