"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PLANOS: Record<string, string> = {
  START: "10GB + WhatsApp e redes ilimitados",
  TURBO: "30GB + vídeo ilimitado + hotspot",
  ILIMITADO: "Internet 100% ilimitada",
};

function Conteudo() {
  const params = useSearchParams();
  const txId = params.get("tx") || "";

  const [dados, setDados] = useState<{
    status: string;
    valor: number;
    plano: string;
  } | null>(null);

  useEffect(() => {
    if (!txId) return;

    let ativo = true;

    async function consultar() {
      try {
        const r = await fetch(`/api/status/${txId}`, { cache: "no-store" });
        const d = await r.json();
        if (ativo && d.status) setDados(d);
      } catch {
        // silencioso
      }
    }

    consultar();
    const intervalo = setInterval(consultar, 5000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [txId]);

  const pago = dados?.status === "paid";

  return (
    <main className="min-h-screen bg-[#08090B] px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-[#14171C] p-8 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              pago ? "bg-[#2563EB]" : "bg-white/10"
            }`}
          >
            {pago ? "✓" : "⏳"}
          </div>

          <h1 className="mt-6 text-2xl font-black">
            {pago ? "Pagamento confirmado" : "Confirmando seu pagamento"}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {pago
              ? "Seu pedido foi aprovado. O QR Code do e-SIM chega no seu e-mail em instantes — confira também a caixa de spam."
              : "Estamos verificando o pagamento junto ao banco. Isso leva só alguns segundos."}
          </p>

          {dados && (
            <div className="mt-6 space-y-2 rounded-xl border border-white/10 bg-[#0E1013] p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Plano</span>
                <span className="font-bold">{dados.plano}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Valor</span>
                <span className="font-bold">
                  R$ {dados.valor.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Status</span>
                <span className={`font-bold ${pago ? "text-[#60A5FA]" : "text-white/60"}`}>
                  {pago ? "Pago" : "Aguardando"}
                </span>
              </div>
              {dados.plano && PLANOS[dados.plano] && (
                <p className="border-t border-white/10 pt-2 text-xs text-white/40">
                  {PLANOS[dados.plano]}
                </p>
              )}
            </div>
          )}

          {pago && (
            <div className="mt-6 rounded-xl border border-[#2563EB]/40 bg-[#2563EB]/5 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
                Próximos passos
              </p>
              <ol className="mt-3 space-y-2 text-sm text-white/70">
                <li>1. Abra o e-mail com o QR Code do e-SIM</li>
                <li>2. Vá em Ajustes → Celular → Adicionar e-SIM</li>
                <li>3. Escaneie o QR Code e ative</li>
              </ol>
            </div>
          )}

          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-[#2563EB] px-8 py-3 text-sm font-bold transition hover:bg-[#1d4ed8]"
          >
            Voltar ao site
          </Link>

          {!pago && (
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/40">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#2563EB]" />
              Verificando automaticamente
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#08090B]" />}>
      <Conteudo />
    </Suspense>
  );
}
