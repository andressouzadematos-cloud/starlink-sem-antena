"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const VALORES: Record<string, number> = {
  START: 24.9,
  TURBO: 34.9,
  ILIMITADO: 49.9,
};

function ObrigadoConteudo() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("txid");
  const [confirmado, setConfirmado] = useState(false);

  useEffect(() => {
    if (!txId) return;

    let ativo = true;

    async function verificar() {
      try {
        const resposta = await fetch(`/api/status/${txId}`, { cache: "no-store" });
        if (!resposta.ok) return;
        const dados = await resposta.json();
        if (!ativo) return;

        if (dados.status === "paid") {
          setConfirmado(true);
          ativo = false;

          const chave = `purchase_enviado_${txId}`;
          if (localStorage.getItem(chave)) return;

          if (typeof window !== "undefined" && window.fbq) {
            window.fbq("track", "Purchase", {
              currency: "BRL",
              value: dados.valor || VALORES[dados.plano] || 34.9,
              content_name: dados.plano,
            });
            localStorage.setItem(chave, "1");
          }
        }
      } catch {
        // silencioso
      }
    }

    verificar();
    const intervalo = setInterval(verificar, 5000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [txId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090B] px-5 py-12 text-white">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#2563EB]/15">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            className="h-10 w-10"
          >
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="mt-8 text-3xl font-black tracking-tight md:text-4xl">
          {confirmado ? "Pagamento confirmado!" : "Pedido recebido!"}
        </h1>

        <p className="mt-4 leading-relaxed text-white/70">
          {confirmado
            ? "Seu e-SIM está sendo preparado. Em instantes você recebe o QR Code de ativação no e-mail cadastrado."
            : "Estamos aguardando a confirmação do PIX. Assim que o pagamento for identificado, você recebe o e-SIM por e-mail."}
        </p>

        {txId && (
          <p className="mt-6 rounded-lg border border-white/10 bg-[#14171C] px-4 py-3 text-xs text-white/50">
            Pedido: <span className="font-mono text-white/70">{txId}</span>
          </p>
        )}

        <div className="mt-8 rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 p-5 text-left">
          <p className="text-sm font-bold text-[#60A5FA]">Próximos passos</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li>1. Confira sua caixa de entrada e o spam</li>
            <li>2. Abra o e-mail com o QR Code do e-SIM</li>
            <li>3. Escaneie em Configurações → Celular → e-SIM</li>
            <li>4. Ative e comece a navegar</li>
          </ul>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-white/20 px-8 py-3.5 text-sm font-bold transition-colors hover:border-white/50"
        >
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}

export default function Obrigado() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090B]" />}>
      <ObrigadoConteudo />
    </Suspense>
  );
}
