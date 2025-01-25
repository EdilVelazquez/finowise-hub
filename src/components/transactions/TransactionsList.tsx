import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export function TransactionsList() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          account:accounts(name),
          category:categories(name)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Cargando transacciones...</div>;
  }

  const getTransactionTypeLabel = (type: string) => {
    return type === "income" ? "Ingreso" : "Gasto";
  };

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
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions?.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{format(new Date(transaction.date), "dd/MM/yyyy")}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>{transaction.account?.name}</TableCell>
            <TableCell>{transaction.category?.name}</TableCell>
            <TableCell>{getTransactionTypeLabel(transaction.type)}</TableCell>
            <TableCell className="text-right">
              <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                {formatCurrency(transaction.amount)}
              </span>
            </TableCell>
          </TableRow>
        ))}
        {transactions?.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No hay transacciones registradas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}