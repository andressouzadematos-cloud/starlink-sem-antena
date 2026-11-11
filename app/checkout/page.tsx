"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const PLANOS: Record<string, { nome: string; valor: number }> = {
  start: { nome: "START", valor: 24.9 },
  turbo: { nome: "TURBO", valor: 34.9 },
  ilimitado: { nome: "ILIMITADO", valor: 49.9 },
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type RespostaPix = {
  txId: string;
  qrCode: string;
  qrCodeTexto: string;
  valor: number;
  plano: string;
};

function CheckoutConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planoId = (searchParams.get("plano") || "turbo").toLowerCase();
  const plano = PLANOS[planoId] || PLANOS.turbo;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pix, setPix] = useState<RespostaPix | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    if (!pix?.txId) return;

    let ativo = true;

    async function consultar() {
      try {
        const resposta = await fetch(`/api/status/${pix!.txId}`, { cache: "no-store" });
        if (!resposta.ok) return;
        const dados = await resposta.json();
        if (!ativo) return;

        setStatus(dados.status);

        if (dados.status === "paid") {
          ativo = false;
          setTimeout(() => {
            router.push(`/obrigado?txid=${pix!.txId}`);
          }, 1800);
        }
      } catch {
        // tenta de novo no próximo ciclo
      }
    }

    consultar();
    const intervalo = setInterval(consultar, 5000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [pix, router]);

  function formatarDocumento(valor: string) {
    const nums = valor.replace(/\D/g, "").slice(0, 14);
    if (nums.length <= 11) {
      return nums
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return nums
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }

  function formatarTelefone(valor: string) {
    const nums = valor.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 10) {
      return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    }
    return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  }

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !email.trim() || !documento.trim() || !telefone.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          documento: documento.replace(/\D/g, ""),
          telefone: telefone.replace(/\D/g, ""),
          plano: planoId,
          marca: marca.trim(),
          modelo: modelo.trim(),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível gerar o PIX.");
        return;
      }

      setPix(dados);

      if (typeof window !== "undefined" && window.fbq) {
        window.fbq("track", "AddPaymentInfo", {
          currency: "BRL",
          value: dados.valor,
          content_name: dados.plano,
        });
      }
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function copiar() {
    if (!pix?.qrCodeTexto) return;
    try {
      await navigator.clipboard.writeText(pix.qrCodeTexto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErro("Não foi possível copiar. Selecione o código manualmente.");
    }
  }

  if (pix) {
    return (
      <main className="min-h-screen bg-[#08090B] px-5 py-12 text-white">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-[#14171C] p-8 text-center">
            <h1 className="text-2xl font-black">Pague com PIX</h1>
            <p className="mt-2 text-sm text-white/60">
              Plano {pix.plano} · R$ {pix.valor.toFixed(2).replace(".", ",")}
            </p>

            <div className="mx-auto mt-6 w-fit rounded-xl bg-white p-3">
              <img
                src={pix.qrCode}
                alt="QR Code do PIX"
                className="h-56 w-56 object-contain"
              />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-wider text-white/50">
              Ou copie o código
            </p>
            <div className="mt-2 break-all rounded-lg border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-white/70">
              {pix.qrCodeTexto}
            </div>

            <button
              onClick={copiar}
              className="mt-4 w-full rounded-full bg-[#2563EB] py-3.5 text-sm font-extrabold transition-transform duration-300 hover:scale-105"
            >
              {copiado ? "Código copiado" : "Copiar código PIX"}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
              {status === "paid"
                ? "Pagamento confirmado. Redirecionando..."
                : "Aguardando pagamento"}
            </div>

            <p className="mt-4 text-[11px] text-white/40">
              O QR Code expira em 30 minutos. Após o pagamento, a confirmação é automática.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090B] px-5 py-12 text-white">
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-white/50 transition-colors hover:text-white"
        >
          ← Voltar
        </button>

        <h1 className="mt-6 text-3xl font-black tracking-tight">Finalizar pedido</h1>
        <p className="mt-1 text-sm text-[#60A5FA]">
          Plano {plano.nome} · R$ {plano.valor.toFixed(2).replace(".", ",")}/mês
        </p>

        <form onSubmit={pagar} className="mt-8 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              Nome completo
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#14171C] px-4 py-3 text-sm outline-none transition-colors focus:border-[#2563EB]"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#14171C] px-4 py-3 text-sm outline-none transition-colors focus:border-[#2563EB]"
              placeholder="voce@email.com"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              CPF ou CNPJ
            </label>
            <input
              value={documento}
              onChange={(e) => setDocumento(formatarDocumento(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#14171C] px-4 py-3 text-sm outline-none transition-colors focus:border-[#2563EB]"
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
              Telefone
            </label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#14171C] px-4 py-3 text-sm outline-none transition-colors focus:border-[#2563EB]"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-[#14171C] p-4">
            <p className="text-sm font-bold">Qual celular você vai usar?</p>
            <p className="mt-1 text-xs text-white/50">
              Usamos essa informação para enviar o e-SIM já configurado para o seu aparelho.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Marca
                </label>
                <input
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2563EB]"
                  placeholder="Samsung"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                  Modelo
                </label>
                <input
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2563EB]"
                  placeholder="Galaxy S23"
                />
              </div>
            </div>
          </div>

          {erro && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-full bg-[#2563EB] py-4 text-base font-extrabold transition-transform duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando
              ? "Gerando PIX..."
              : `Pagar R$ ${plano.valor.toFixed(2).replace(".", ",")}`}
          </button>

          <p className="text-center text-[11px] text-white/40">
            Pagamento seguro via PIX · Ativação imediata
          </p>
        </form>
      </div>
    </main>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090B]" />}>
      <CheckoutConteudo />
    </Suspense>
  );
}
