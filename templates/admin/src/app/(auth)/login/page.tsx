"use client";

import { t } from "@/lib/i18n";
import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { login } from "@/app/login-actions";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return <main className="flex min-h-svh items-center justify-center bg-navy p-4">
    <div className="grid w-full max-w-sm gap-6">
      <BrandLogo priority className="mx-auto h-14"/>
      <Card className="border-0 shadow-xl">
        <CardHeader><CardTitle>{t.auth.loginTitle}</CardTitle><CardDescription>{t.auth.loginDescription}</CardDescription></CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              <Field><FieldLabel htmlFor="email">{t.fields.email}</FieldLabel><Input id="email" name="email" type="email" autoComplete="username" required autoFocus/></Field>
              <Field><FieldLabel htmlFor="password">{t.auth.password}</FieldLabel><Input id="password" name="password" type="password" autoComplete="current-password" required/></Field>
              {state?.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" size="lg" disabled={pending}>{pending ? <Spinner/> : <LogIn/>}{t.auth.signIn}</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  </main>;
}
