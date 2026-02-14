import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Filters, yearly overview, and CSV/PDF export. Coming next.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reports &amp; export</CardTitle>
          <CardDescription>Filter by month, year, employee, department.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
