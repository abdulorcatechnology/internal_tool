import Heading from "@/components/layout/Heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Heading
        title="Settings"
        description="Admin email for salary reminders and other options. Coming next."
      />
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Configure reminder email and app settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Settings form will go here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
