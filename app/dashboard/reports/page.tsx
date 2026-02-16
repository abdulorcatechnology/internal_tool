import Heading from "@/components/layout/Heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Heading
          title="Reports"
          description="Filters, yearly overview, and CSV/PDF export. Coming next."
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Reports &amp; export</CardTitle>
          <CardDescription>
            Filter by month, year, employee, department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No reports yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
