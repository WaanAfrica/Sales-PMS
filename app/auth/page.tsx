import { auth } from "../../auth";
import { redirect } from "next/navigation";

export default async function AuthPage() {
  const session = (await auth()) as any;

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/dashboard");
}
