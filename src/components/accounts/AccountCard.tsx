import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

type AccountCardProps = {
  account: any;
  onEdit: (account: any) => void;
  onDelete: (account: any) => void;
  onClick: () => void;
};

export function AccountCard({ account, onEdit, onDelete, onClick }: AccountCardProps) {
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
    <Card className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={onClick}>
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
                  onEdit(account);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(account);
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
              className={`text-xl ${account.calculated_balance < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {formatCurrency(account.calculated_balance)}
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
  );
}