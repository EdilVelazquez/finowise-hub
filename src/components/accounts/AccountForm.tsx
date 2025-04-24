
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";

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
  has_installments: z.boolean().default(false),
  total_installments: z.string().optional(),
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
      has_installments: initialData?.has_installments || false,
      total_installments: initialData?.total_installments || "",
    },
  });

  async function onSubmit(values: z.infer<typeof accountFormSchema>) {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const accountData = {
        name: values.name,
        type: values.type,
        initial_balance: Number(values.initialBalance),
        balance: Number(values.initialBalance),
        credit_limit: values.type === "credit" ? Number(values.creditLimit) : null,
        user_id: user.id,
        is_current_account: values.type === "checking",
        payment_type: values.type === "checking" ? values.paymentType : null,
        has_installments: values.has_installments,
        total_installments: values.has_installments ? parseInt(values.total_installments || "0") : null,
      };

      if (initialData) {
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
        const { data: newAccount, error } = await supabase
          .from("accounts")
          .insert(accountData)
          .select()
          .single();

        if (error) throw error;

        if (values.has_installments && newAccount) {
          const installmentAmount = Number(values.initialBalance) / Number(values.total_installments);
          const installments = Array.from({ length: Number(values.total_installments) }, (_, i) => ({
            account_id: newAccount.id,
            user_id: user.id,
            installment_number: i + 1,
            amount: installmentAmount,
            remaining_amount: installmentAmount,
            due_date: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
            status: 'pending'
          }));

          const { error: installmentsError } = await supabase
            .from('installments')
            .insert(installments);

          if (installmentsError) throw installmentsError;
        }
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

  const showInstallments = form.watch("type") === "checking" && 
                          form.watch("paymentType") === "payable";

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

        {showInstallments && (
          <>
            <FormField
              control={form.control}
              name="has_installments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Cuenta con pagos estructurados
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("has_installments") && (
              <FormField
                control={form.control}
                name="total_installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de mensualidades</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

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
