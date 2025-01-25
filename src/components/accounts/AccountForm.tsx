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

const accountFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["checking", "savings", "credit", "debit", "cash"], {
    required_error: "Selecciona un tipo de cuenta",
  }),
  balance: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Debe ser un número válido",
  }),
  creditLimit: z.string().optional(),
});

export function AccountForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof accountFormSchema>>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      balance: "0",
      creditLimit: "",
    },
  });

  async function onSubmit(values: z.infer<typeof accountFormSchema>) {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { error } = await supabase.from("accounts").insert({
        name: values.name,
        type: values.type,
        balance: Number(values.balance),
        credit_limit: values.type === "credit" ? Number(values.creditLimit) : null,
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Cuenta creada",
        description: "La cuenta se ha creado exitosamente",
      });
      form.reset();
    } catch (error) {
      console.error("Error creating account:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la cuenta. Intenta nuevamente.",
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

        {form.watch("type") === "credit" && (
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
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
    </Form>
  );
}