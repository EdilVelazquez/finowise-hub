import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
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
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AccountTypeSelect } from "./AccountTypeSelect";
import { AccountBalanceFields } from "./AccountBalanceFields";

const accountFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["checking", "savings", "credit", "debit", "cash"], {
    required_error: "Selecciona un tipo de cuenta",
  }),
  initialBalance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Debe ser un número válido",
  }),
  creditLimit: z.string().optional(),
  paymentType: z.enum(["receivable", "payable"]).optional(),
});

type AccountFormProps = {
  onSuccess?: () => void;
  initialData?: any;
};

export function AccountForm({ onSuccess, initialData }: AccountFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || "",
      initialBalance: initialData?.initial_balance?.toString() || "0",
      creditLimit: initialData?.credit_limit?.toString() || "",
      paymentType: initialData?.payment_type || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof accountFormSchema>) {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const accountData = {
        name: values.name,
        type: values.type,
        initial_balance: Number(values.initialBalance),
        balance: Number(values.initialBalance),
        credit_limit: values.type === "credit" ? Number(values.creditLimit) : null,
        user_id: user.id,
        is_current_account: values.type === "checking",
        payment_type: values.type === "checking" ? values.paymentType : null,
      };

      if (initialData) {
        // Si estamos editando, recalculamos el balance actual
        const { data: transactions, error: transactionsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("account_id", initialData.id);

        if (transactionsError) throw transactionsError;

        let currentBalance = Number(values.initialBalance);

        transactions?.forEach((t) => {
          if (values.type === "checking") {
            if (values.paymentType === "receivable") {
              currentBalance += t.type === "payment" ? -t.amount : t.amount;
            } else {
              currentBalance += t.type === "payment" ? t.amount : -t.amount;
            }
          } else {
            currentBalance += t.type === "income" ? t.amount : -t.amount;
          }
        });

        const { error } = await supabase
          .from("accounts")
          .update({
            ...accountData,
            balance: currentBalance,
          })
          .eq("id", initialData.id);

        if (error) throw error;
        toast({
          title: "Cuenta actualizada",
          description: "La cuenta se ha actualizado exitosamente",
        });
      } else {
        const { error } = await supabase
          .from("accounts")
          .insert(accountData);

        if (error) throw error;
        toast({
          title: "Cuenta creada",
          description: "La cuenta se ha creado exitosamente",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating/updating account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la cuenta. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la cuenta</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Cuenta de ahorros" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AccountTypeSelect form={form} />
        <AccountBalanceFields form={form} />

        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (initialData ? "Actualizando cuenta..." : "Creando cuenta...") 
            : (initialData ? "Actualizar cuenta" : "Crear cuenta")
          }
        </Button>
      </form>
    </Form>
  );
}