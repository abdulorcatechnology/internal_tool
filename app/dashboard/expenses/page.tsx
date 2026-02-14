import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Office Expenses</h1>
        <p className="text-muted-foreground">
          Fixed assets and day-to-day expenses. Coming next.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Fixed assets &amp; day-to-day categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No expenses yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
