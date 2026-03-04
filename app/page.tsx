import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Button variant="default" asChild>
        <Link href="/login">Login</Link>
      </Button>
    </div>
  );
}
