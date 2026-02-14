import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Salary</h1>
        <p className="text-muted-foreground">
          Monthly salary records and payment status. Coming next.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Salary records</CardTitle>
          <CardDescription>Pending / Paid / Deferred and receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No salary records yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
