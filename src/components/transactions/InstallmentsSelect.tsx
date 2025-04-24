
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface InstallmentsSelectProps {
  accountId: string;
  onInstallmentSelect: (installmentId: string) => void;
  selectedInstallmentId?: string;
}

export function InstallmentsSelect({
  accountId,
  onInstallmentSelect,
  selectedInstallmentId,
}: InstallmentsSelectProps) {
  const { data: installments, isLoading } = useQuery({
    queryKey: ["installments", accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installments")
        .select("*")
        .eq("account_id", accountId)
        .or("status.eq.pending,status.eq.partial")
        .order("installment_number");

      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });

  if (isLoading) return <div>Cargando mensualidades...</div>;

  if (!installments?.length) {
    return <div className="text-sm text-gray-500">No hay mensualidades pendientes</div>;
  }

  return (
    <Select
      value={selectedInstallmentId}
      onValueChange={onInstallmentSelect}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona la mensualidad" />
      </SelectTrigger>
      <SelectContent>
        {installments.map((installment) => (
          <SelectItem key={installment.id} value={installment.id}>
            Pago {installment.installment_number} - {formatCurrency(installment.remaining_amount)}
            {installment.status === "partial" ? " (Pago parcial)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
