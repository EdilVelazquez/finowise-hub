import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  onFilterChange: (filters: {
    account_id?: string;
    category_id?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export function TransactionsFilter({ onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    account_id: "",
    category_id: "",
    startDate: "",
    endDate: "",
  });

  const { data: accounts } = useQuery({
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

  const { data: categories } = useQuery({
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

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Select
        onValueChange={(value) => handleFilterChange("account_id", value)}
        value={filters.account_id}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por cuenta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las cuentas</SelectItem>
          {accounts?.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => handleFilterChange("category_id", value)}
        value={filters.category_id}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories?.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        placeholder="Fecha inicial"
        value={filters.startDate}
        onChange={(e) => handleFilterChange("startDate", e.target.value)}
      />

      <Input
        type="date"
        placeholder="Fecha final"
        value={filters.endDate}
        onChange={(e) => handleFilterChange("endDate", e.target.value)}
      />
    </div>
  );
}