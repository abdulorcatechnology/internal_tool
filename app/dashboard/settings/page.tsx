import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Admin email for salary reminders and other options. Coming next.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Configure reminder email and app settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Settings form will go here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
