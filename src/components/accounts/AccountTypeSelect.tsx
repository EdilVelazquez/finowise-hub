import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

type AccountTypeSelectProps = {
  form: UseFormReturn<any>;
};

export function AccountTypeSelect({ form }: AccountTypeSelectProps) {
  return (
    <>
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

      {form.watch("type") === "checking" && (
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
    </>
  );
}