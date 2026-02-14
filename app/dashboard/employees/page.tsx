import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Add, edit, and manage employees. Coming next.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Employee list</CardTitle>
          <CardDescription>CRUD and filters will go here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No employees yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
