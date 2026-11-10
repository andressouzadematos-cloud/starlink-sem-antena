"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PLANOS: Record<string, { nome: string; valor: number }> = {
  start: { nome: "START", valor: 24.9 },
  turbo: { nome: "TURBO", valor: 34.9 },
  ilimitado: { nome: "ILIMITADO", valor: 49.9 },
};

const MARCAS = [
  "Apple", "Samsung", "Motorola", "Xiaomi", "realme", "POCO", "Google", "OnePlus",
  "Honor", "Huawei", "Oppo", "vivo", "Nokia", "Asus", "Sony", "LG",
  "ZTE", "Infinix", "Tecno", "TCL", "Lenovo", "Meizu", "Nubia", "Nothing",
  "Blackview", "Ulefone", "Doogee", "Oukitel", "Cubot", "Alcatel", "Positivo", "Multilaser",
];

const MODELOS: Record<string, string[]> = {
  Apple: ["iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone 12", "iPhone 12 Pro", "iPhone 13", "iPhone 13 Pro", "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro", "iPhone 16", "iPhone SE 2020", "iPhone SE 2022", "iPad Pro", "iPad Air", "iPad mini"],
  Samsung: ["Galaxy S20", "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24", "Galaxy S25", "Galaxy Z Flip 4", "Galaxy Z Flip 5", "Galaxy Z Fold 4", "Galaxy Z Fold 5", "Galaxy Note 20", "Galaxy A54", "Galaxy A55", "Galaxy A35"],
  Motorola: ["Edge 30", "Edge 40", "Edge 40 Neo", "Edge 50", "Edge 50 Pro", "Edge 50 Ultra", "Razr 40", "Razr 40 Ultra", "Razr 50", "Razr 50 Ultra", "Moto G54 5G", "Moto G84 5G"],
  Xiaomi: ["Xiaomi 13", "Xiaomi 14", "Xiaomi 14T", "Xiaomi 14T Pro", "Xiaomi 15", "Redmi Note 13 Pro 5G", "Redmi Note 14 Pro 5G", "Redmi 13C"],
  realme: ["realme 11 Pro", "realme 12 Pro", "realme 12 Pro+", "realme GT 5", "realme GT 6", "realme C67 5G"],
  POCO: ["POCO X5 Pro", "POCO X6", "POCO X6 Pro", "POCO F5", "POCO F6", "POCO F6 Pro"],
  Google: ["Pixel 5", "Pixel 6", "Pixel 6 Pro", "Pixel 7", "Pixel 7 Pro", "Pixel 8", "Pixel 8 Pro", "Pixel 9", "Pixel 9 Pro", "Pixel Fold"],
  OnePlus: ["OnePlus 9", "OnePlus 10 Pro", "OnePlus 11", "OnePlus 12", "OnePlus 12R", "OnePlus Nord 3", "OnePlus Nord 4"],
  Honor: ["Honor Magic 5", "Honor Magic 6", "Honor 90", "Honor 200", "Honor 200 Pro"],
  Huawei: ["Huawei P40", "Huawei P50", "Huawei P60", "Huawei Mate 40", "Huawei Mate 50"],
  Oppo: ["Oppo Find X3", "Oppo Find X5", "Oppo Find X8", "Oppo Reno 8", "Oppo Reno 10", "Oppo Reno 12"],
  vivo: ["vivo X80", "vivo X90", "vivo X100", "vivo V29", "vivo V30"],
  Nokia: ["Nokia X30", "Nokia G60", "Nokia XR21"],
  Asus: ["Zenfone 9", "Zenfone 10", "Zenfone 11 Ultra", "ROG Phone 6", "ROG Phone 7", "ROG Phone 8"],
  Sony: ["Xperia 1 IV", "Xperia 1 V", "Xperia 1 VI", "Xperia 5 IV", "Xperia 5 V"],
  LG: ["LG Velvet", "LG V60 ThinQ"],
  ZTE: ["ZTE Axon 40 Ultra", "ZTE Axon 50", "ZTE Blade V50"],
  Infinix: ["Infinix Note 30", "Infinix Note 40 Pro", "Infinix Zero 30"],
  Tecno: ["Tecno Camon 20", "Tecno Camon 30", "Tecno Phantom V Fold"],
  TCL: ["TCL 40 SE", "TCL 50 Pro NxtPaper"],
  Lenovo: ["Legion Y70", "Legion Duel 2"],
  Meizu: ["Meizu 20", "Meizu 21"],
  Nubia: ["Nubia Z50", "Nubia Z60 Ultra", "Red Magic 8 Pro", "Red Magic 9 Pro"],
  Nothing: ["Nothing Phone (1)", "Nothing Phone (2)", "Nothing Phone (2a)", "Nothing Phone (3a)"],
  Blackview: ["Blackview A200 Pro", "Blackview BL9000"],
  Ulefone: ["Ulefone Armor 24", "Ulefone Power Armor 18T"],
  Doogee: ["Doogee V30", "Doogee S110"],
  Oukitel: ["Oukitel WP30 Pro", "Oukitel WP21"],
  Cubot: ["Cubot KingKong 9", "Cubot X70"],
  Alcatel: ["Alcatel 1B", "Alcatel 1S 2021"],
  Positivo: ["Positivo Q20", "Positivo Twist 6"],
  Multilaser: ["Multilaser G Max 2", "Multilaser H 5G"],
};

function formatarDoc(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function formatarTel(v: string) {
  const t = v.replace(/\D/g, "").slice(0, 11);
  if (t.length <= 10) {
    return t.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return t.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function CheckoutConteudo() {
  const params = useSearchParams();
  const planoId = (params.get("plano") || "turbo").toLowerCase();
  const plano = PLANOS[planoId] || PLANOS.turbo;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [pix, setPix] = useState<{
    txId: string;
    qrCode: string;
    qrCodeTexto: string;
    valor: number;
    plano: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [status, setStatus] = useState("pending");

  const modelosDisponiveis = marca ? MODELOS[marca] || [] : [];
  const podePagar = nome && email && documento && telefone && marca && modelo && !carregando;

  useEffect(() => {
    if (!pix) return;

    const intervalo = setInterval(async () => {
      try {
        const r = await fetch(`/api/status/${pix.txId}`);
        const d = await r.json();
        if (d.status) setStatus(d.status);
      } catch {
        // silencioso
      }
    }, 5000);

    return () => clearInterval(intervalo);
  }, [pix]);

  async function pagar() {
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          documento: documento.replace(/\D/g, ""),
          telefone: telefone.replace(/\D/g, ""),
          plano: planoId,
          marca,
          modelo,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível gerar o PIX.");
        return;
      }

      setPix(dados);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function copiar() {
    if (!pix) return;
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
      <main className="min-h-screen bg-[#08090B] px-5 py-16 text-white">
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-[#14171C] p-8 text-center">
            {status === "paid" ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2563EB] text-3xl">
                  ✓
                </div>
                <h1 className="mt-6 text-2xl font-black">Pagamento confirmado</h1>
                <p className="mt-3 text-white/70">
                  Seu e-SIM será enviado para <strong className="text-white">{email}</strong> em
                  instantes.
                </p>
                <Link
                  href="/"
                  className="mt-8 inline-block rounded-full bg-[#2563EB] px-8 py-3 text-sm font-bold hover:bg-[#1d4ed8]"
                >
                  Voltar ao site
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black">Pague com PIX</h1>
                <p className="mt-2 text-sm text-white/60">
                  Plano {pix.plano} · R$ {pix.valor.toFixed(2).replace(".", ",")}
                </p>

                <div className="mx-auto mt-8 w-fit rounded-xl bg-white p-3">
                  <img src={pix.qrCode} alt="QR Code PIX" className="h-56 w-56" />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Ou copie o código
                </p>
                <div className="mt-2 break-all rounded-xl border border-white/10 bg-[#0E1013] p-4 text-xs text-white/60">
                  {pix.qrCodeTexto.slice(0, 120)}...
                </div>

                <button
                  onClick={copiar}
                  className="mt-4 w-full rounded-full bg-[#2563EB] py-4 text-sm font-extrabold hover:bg-[#1d4ed8]"
                >
                  {copiado ? "Copiado!" : "Copiar código PIX"}
                </button>

                <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#2563EB]" />
                  Aguardando pagamento...
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090B] px-5 py-16 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-white/50 hover:text-white">
          ← Voltar
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#14171C] p-8">
          <h1 className="text-2xl font-black">Finalizar pedido</h1>
          <p className="mt-2 text-sm text-white/60">
            Plano <strong className="text-[#60A5FA]">{plano.nome}</strong> · R${" "}
            {plano.valor.toFixed(2).replace(".", ",")}/mês
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                Nome completo
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0E1013] px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#0E1013] px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                placeholder="voce@email.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  CPF ou CNPJ
                </label>
                <input
                  value={documento}
                  onChange={(e) => setDocumento(formatarDoc(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0E1013] px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                  Telefone
                </label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTel(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#0E1013] px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-sm font-bold">Qual celular você vai usar?</p>
              <p className="mt-1 text-xs text-white/40">
                Usamos essa informação para enviar o e-SIM já configurado para o seu aparelho.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Marca
                  </label>
                  <select
                    value={marca}
                    onChange={(e) => {
                      setMarca(e.target.value);
                      setModelo("");
                    }}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0E1013] px-4 py-3 text-sm outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Selecione a marca</option>
                    {MARCAS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/50">
                    Modelo
                  </label>
                  <select
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    disabled={!marca}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#0E1013] px-4 py-3 text-sm outline-none focus:border-[#2563EB] disabled:opacity-40"
                  >
                    <option value="">Selecione o modelo</option>
                    {modelosDisponiveis.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {erro && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </p>
          )}

          <button
            onClick={pagar}
            disabled={!podePagar}
            className="mt-6 w-full rounded-full bg-[#2563EB] py-4 text-sm font-extrabold transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {carregando ? "Gerando PIX..." : `Pagar R$ ${plano.valor.toFixed(2).replace(".", ",")}`}
          </button>

          <p className="mt-4 text-center text-xs text-white/30">
            Pagamento seguro via PIX · Ativação imediata
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#08090B]" />}>
      <CheckoutConteudo />
    </Suspense>
  );
}
