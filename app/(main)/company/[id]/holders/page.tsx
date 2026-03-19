import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function HoldersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and options. Customize your experience
          to fit your needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Configure notifications, security, and themes.
      </CardContent>
    </Card>
  );
}
