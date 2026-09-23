"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Building2, Users, Lock, Mail, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencySlug, setAgencySlug] = useState("inmobia360");
  const [planType, setPlanType] = useState<"solo" | "boutique">("boutique");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const targetEmail = customEmail || email;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          password: password || "demo1234",
          tenant_slug: agencySlug
        })
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("demo2026");
    handleLogin(undefined, roleEmail);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Circular */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md p-1.5 mb-3">
          <div className="w-full h-full rounded-xl border-2 border-emerald-400 flex items-center justify-center text-white font-extrabold text-sm">
            360°
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Inmobia 360
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
          SaaS de Dirección Inmobiliaria con Inteligencia Artificial
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-3xl sm:px-10">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="director@tu-agencia.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tipo de Cuenta / Plazas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlanType("solo")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    planType === "solo"
                      ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[11px] font-bold">Autónomo</div>
                  <div className="text-[10px] text-slate-400">1 Asiento individual</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType("boutique")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    planType === "boutique"
                      ? "border-blue-600 bg-blue-50 text-blue-900 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[11px] font-bold">Agencia Boutique</div>
                  <div className="text-[10px] text-slate-400">Hasta 5 Agentes</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Entrar a la Plataforma
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Acceso Rápido a Demos */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
              Acceso Rápido de Prueba (1 Clic)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDemo("director@inmobia360.com")}
                className="py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                Director Broker
              </button>
              <button
                onClick={() => handleQuickDemo("agente@inmobia360.com")}
                className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <Users className="w-3 h-3 text-slate-600" />
                Agente Asociado
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Aislamiento RLS Multi-Tenant Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
