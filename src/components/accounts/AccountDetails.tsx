import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type AccountDetailsProps = {
  account: any;
  transactions: any[];
};

export function AccountDetails({ account, transactions }: AccountDetailsProps) {
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
    <div className="mt-4">
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Tipo de cuenta</p>
            <p className="font-medium">{getAccountTypeLabel(account.type)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Saldo actual</p>
            <p className={`font-medium ${account.calculated_balance < 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(account.calculated_balance)}
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
        {transactions.map((transaction) => (
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
        {transactions.length === 0 && (
          <p className="text-center text-gray-500">No hay transacciones</p>
        )}
      </div>
    </div>
  );
}