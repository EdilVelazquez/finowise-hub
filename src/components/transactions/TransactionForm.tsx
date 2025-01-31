import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const transactionSchema = z.object({
  type: z.enum(["income", "expense", "payment", "credit"]),
  amount: z.string().min(1, "El monto es requerido"),
  description: z.string().optional(),
  account_id: z.string().min(1, "La cuenta es requerida"),
  category_id: z.string().min(1, "La categoría es requerida"),
  date: z.string().min(1, "La fecha es requerida"),
});

type TransactionFormProps = {
  onSuccess?: () => void;
  initialData?: z.infer<typeof transactionSchema> | null;
};

export function TransactionForm({ onSuccess, initialData }: TransactionFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialData?.type || "expense",
      description: initialData?.description || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      amount: initialData?.amount || "",
      account_id: initialData?.account_id || "",
      category_id: initialData?.category_id || "",
    },
  });

  const selectedAccountId = form.watch("account_id");
  const selectedType = form.watch("type");

  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const selectedAccount = accounts?.find((acc) => acc.id === selectedAccountId);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const getTransactionTypeColor = (type: string) => {
    if (!selectedAccount) return "text-gray-900";
    
    if (selectedAccount.is_current_account) {
      if (selectedAccount.payment_type === "receivable") {
        return type === "payment" ? "text-red-600" : "text-green-600"; // Pago resta, abono suma
      } else {
        return type === "payment" ? "text-green-600" : "text-red-600"; // Pago suma, abono resta
      }
    } else {
      return type === "income" ? "text-green-600" : "text-red-600";
    }
  };

  async function onSubmit(values: z.infer<typeof transactionSchema>) {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      const selectedAccount = accounts?.find(
        (acc) => acc.id === values.account_id
      );

      if (!selectedAccount) throw new Error("Account not found");

      const selectedCategory = categories?.find(
        (cat) => cat.id === values.category_id
      );

      if (!selectedCategory) throw new Error("Category not found");

      const transactionAmount = parseFloat(values.amount);

      // Calculate new balance based on initial_balance and all transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", selectedAccount.id);

      if (transactionsError) throw transactionsError;

      let newBalance = selectedAccount.initial_balance || 0;

      // Calculate balance from existing transactions
      transactions?.forEach((t) => {
        if (selectedAccount.is_current_account) {
          if (selectedAccount.payment_type === "receivable") {
            newBalance += t.type === "payment" ? -t.amount : t.amount;
          } else {
            newBalance += t.type === "payment" ? t.amount : -t.amount;
          }
        } else {
          newBalance += t.type === "income" ? t.amount : -t.amount;
        }
      });

      // Add the new transaction to the balance
      if (selectedAccount.is_current_account) {
        if (selectedAccount.payment_type === "receivable") {
          newBalance += values.type === "payment" ? -transactionAmount : transactionAmount;
        } else {
          newBalance += values.type === "payment" ? transactionAmount : -transactionAmount;
        }
      } else {
        newBalance += values.type === "income" ? transactionAmount : -transactionAmount;
      }

      const { error: accountError } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("id", selectedAccount.id);

      if (accountError) throw accountError;

      const { error } = await supabase.from("transactions").insert({
        ...values,
        amount: transactionAmount,
        user_id: user.id,
        type: values.type,
      });

      if (error) throw error;

      toast.success("Transacción registrada exitosamente");
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al registrar la transacción:", error);
      toast.error("Error al registrar la transacción");
    }
  }

  if (isLoadingAccounts || isLoadingCategories) {
    return <div>Cargando...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuenta</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de transacción</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedAccount?.is_current_account ? (
                    <>
                      <SelectItem 
                        value="payment" 
                        className={getTransactionTypeColor("payment")}
                      >
                        Pago {selectedAccount.payment_type === "receivable" ? "(resta)" : "(suma)"}
                      </SelectItem>
                      <SelectItem 
                        value="credit" 
                        className={getTransactionTypeColor("credit")}
                      >
                        Abono {selectedAccount.payment_type === "receivable" ? "(suma)" : "(resta)"}
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem 
                        value="expense" 
                        className={getTransactionTypeColor("expense")}
                      >
                        Gasto (resta)
                      </SelectItem>
                      <SelectItem 
                        value="income" 
                        className={getTransactionTypeColor("income")}
                      >
                        Ingreso (suma)
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción de la transacción" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Registrar transacción</Button>
      </form>
    </Form>
  );
}