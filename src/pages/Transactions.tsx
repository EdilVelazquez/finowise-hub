import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionsList } from "@/components/transactions/TransactionsList";

const Transactions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transacciones</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Nueva transacción</h2>
          <TransactionForm />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Historial de transacciones</h2>
          <TransactionsList />
        </div>
      </div>
    </div>
  );
};

export default Transactions;