import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of payroll and expenses. Add employees and salary data to see
          metrics here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total monthly payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">—</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending salaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">—</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual payroll (YTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">—</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Office expenses (this month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">—</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Charts</CardTitle>
          <CardDescription>
            Payroll by month and expense vs payroll comparison will appear here
            once you add data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-muted-foreground">
            Placeholder for charts
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
