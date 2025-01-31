import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

type AccountBalanceFieldsProps = {
  form: UseFormReturn<any>;
};

export function AccountBalanceFields({ form }: AccountBalanceFieldsProps) {
  const watchType = form.watch("type");

  return (
    <>
      <FormField
        control={form.control}
        name="initialBalance"
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
    </>
  );
}