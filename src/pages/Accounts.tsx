import { AccountForm } from "@/components/accounts/AccountForm";

const Accounts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Cuentas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Crear nueva cuenta</h2>
          <AccountForm />
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Mis cuentas</h2>
          <p className="text-gray-600">Lista de cuentas próximamente...</p>
        </div>
      </div>
    </div>
  );
};

export default Accounts;