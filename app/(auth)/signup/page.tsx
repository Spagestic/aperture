import Image from "next/image";
import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-1 group">
            <Image
              alt="Logo"
              className="h-10 w-10 pixel-crisp dark:invert"
              height={40}
              src="/logo_.png"
              width={40}
            />
            <span className="font-medium">Aperture</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/shooting_star.png"
          alt="Background Image"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
