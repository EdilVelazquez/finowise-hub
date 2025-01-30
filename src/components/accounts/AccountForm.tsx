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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const accountFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["checking", "savings", "credit", "debit", "cash"], {
    required_error: "Selecciona un tipo de cuenta",
  }),
  balance: z.string().refine((val) => !isNaN(Number(val)), {
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
      balance: initialData?.balance?.toString() || "0",
      creditLimit: initialData?.credit_limit?.toString() || "",
      paymentType: initialData?.payment_type || undefined,
    },
  });

  const watchType = form.watch("type");

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
        balance: Number(values.balance),
        credit_limit: values.type === "credit" ? Number(values.creditLimit) : null,
        user_id: user.id,
        is_current_account: values.type === "checking",
        payment_type: values.type === "checking" ? values.paymentType : null,
      };

      if (initialData) {
        const { error } = await supabase
          .from("accounts")
          .update(accountData)
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

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de cuenta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo de cuenta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="checking">Cuenta corriente</SelectItem>
                  <SelectItem value="savings">Cuenta de ahorros</SelectItem>
                  <SelectItem value="credit">Tarjeta de crédito</SelectItem>
                  <SelectItem value="debit">Tarjeta de débito</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === "checking" && (
          <FormField
            control={form.control}
            name="paymentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de cuenta corriente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="receivable">Cuenta por cobrar</SelectItem>
                    <SelectItem value="payable">Cuenta por pagar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo inicial</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === "credit" && (
          <FormField
            control={form.control}
            name="creditLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Límite de crédito</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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