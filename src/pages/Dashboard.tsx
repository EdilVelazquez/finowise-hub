import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Wallet, TrendingUp, TrendingDown, CreditCard } from "lucide-react";

const data = [
  { name: "Jan", income: 4000, expenses: 2400 },
  { name: "Feb", income: 3000, expenses: 1398 },
  { name: "Mar", income: 2000, expenses: 9800 },
  { name: "Apr", income: 2780, expenses: 3908 },
  { name: "May", income: 1890, expenses: 4800 },
  { name: "Jun", income: 2390, expenses: 3800 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="financial-card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Total Balance</p>
              <p className="stat-value">$24,500</p>
            </div>
          </div>
        </Card>

        <Card className="financial-card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Monthly Income</p>
              <p className="stat-value">$8,250</p>
            </div>
          </div>
        </Card>

        <Card className="financial-card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Monthly Expenses</p>
              <p className="stat-value">$5,750</p>
            </div>
          </div>
        </Card>

        <Card className="financial-card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="stat-label">Credit Card Due</p>
              <p className="stat-value">$2,150</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="financial-card">
        <h2 className="text-lg font-semibold mb-4">Income vs Expenses</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="income" fill="#059669" name="Income" />
              <Bar dataKey="expenses" fill="#F97316" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;