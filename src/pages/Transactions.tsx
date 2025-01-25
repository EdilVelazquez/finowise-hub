import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import { CategoriesManager } from "@/components/transactions/CategoriesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Transactions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Transacciones</h1>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">Nueva transacción</h2>
              <TransactionForm />
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                Historial de transacciones
              </h2>
              <TransactionsList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Gestionar Categorías</h2>
            <CategoriesManager />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;