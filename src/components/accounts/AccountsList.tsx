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

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead className="text-right">Límite de crédito</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts?.map((account) => (
          <TableRow key={account.id}>
            <TableCell>{account.name}</TableCell>
            <TableCell>{getAccountTypeLabel(account.type)}</TableCell>
            <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
            <TableCell className="text-right">
              {account.credit_limit ? formatCurrency(account.credit_limit) : "-"}
            </TableCell>
          </TableRow>
        ))}
        {accounts?.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No hay cuentas creadas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}