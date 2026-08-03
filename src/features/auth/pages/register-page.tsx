import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/shared/components/ui/loader";
import { useAuth } from "../hooks/use-auth";
import { registerSchema, type RegisterFormValues } from "../schemas/auth.schema";
import { AuthShell } from "./login-page";

export function RegisterPage() {
  const { register: signUp, isRegistering } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <AuthShell
      title="Criar sua conta"
      subtitle="Comece a organizar suas tarefas em segundos."
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit((values) => signUp(values))} noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" autoComplete="name" placeholder="Seu nome" {...register("name")} />
          {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="voce@email.com" {...register("email")} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="••••••" {...register("password")} />
          {errors.password ? (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? <Spinner className="mr-2" /> : null}
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}
