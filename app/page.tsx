"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const PLANOS = [
  {
    id: "start",
    nome: "START",
    preco: 24.9,
    destaque: false,
    descricao: "Para quem quer sair da operadora sem gastar muito.",
    itens: [
      "10GB de internet móvel",
      "WhatsApp e redes sociais ilimitados",
      "e-SIM incluso · funciona em todo o Brasil",
      "Sem fidelidade, cancela quando quiser",
      "Ativação em minutos por QR Code",
    ],
  },
  {
    id: "turbo",
    nome: "TURBO",
    preco: 34.9,
    destaque: true,
    descricao: "O mais escolhido. Vídeo sem parar e hotspot liberado.",
    itens: [
      "30GB de internet móvel",
      "Apps de vídeo ilimitados (YouTube, Netflix, TikTok)",
      "Hotspot liberado para usar no notebook",
      "e-SIM incluso · funciona em todo o Brasil",
      "Sem fidelidade, cancela quando quiser",
    ],
  },
  {
    id: "ilimitado",
    nome: "ILIMITADO",
    preco: 49.9,
    destaque: false,
    descricao: "Internet 100% ilimitada. Sem redução, sem letra miúda.",
    itens: [
      "Internet 100% ilimitada",
      "Sem redução de velocidade",
      "Hotspot liberado e prioridade na rede",
      "e-SIM incluso · funciona em todo o Brasil",
      "Suporte 24h e sem fidelidade",
    ],
  },
];

const OPERADORAS = [
  {
    nome: "VIVO",
    acusacoes: [
      "Vende 'ilimitado' que reduz a velocidade depois de 5GB.",
      "Cobra R$ 289/mês pela antena e ainda exige fidelidade de 12 meses.",
      "Multa de cancelamento que passa de R$ 800.",
    ],
  },
  {
    nome: "TIM",
    acusacoes: [
      "Cobertura que desaparece a 20 km da cidade.",
      "Técnico que agenda em 15 dias e não aparece.",
      "Aumento de mensalidade sem aviso no meio do contrato.",
    ],
  },
  {
    nome: "CLARO",
    acusacoes: [
      "Ponto extra cobrado como se fosse favor.",
      "Velocidade que cai justo na hora do jogo.",
      "Atendimento que transfere você 6 vezes e desliga.",
    ],
  },
  {
    nome: "OI",
    acusacoes: [
      "Rede que já foi vendida e o cliente ficou sem suporte.",
      "Contrato que ninguém consegue cancelar.",
      "Sinal que só funciona quando o vizinho está usando também.",
    ],
  },
];

const COMPARATIVO_RUIM = [
  "Técnico agenda em 15 dias",
  "Instalação com furo na parede",
  "Fidelidade de 12 meses com multa",
  "Cai na chuva e no vento",
  "R$ 250+ de mensalidade",
  "Cobrança de ponto extra",
  "Cancelar é uma novela",
];

const COMPARATIVO_BOM = [
  "Chega no seu e-mail em minutos",
  "Zero instalação, zero técnico",
  "Sem fidelidade, cancela quando quiser",
  "Funciona na chuva, no vento e no mato",
  "A partir de R$ 24,90",
  "Sem taxa escondida",
  "e-SIM digital que cobre todo o Brasil",
];

const ESIM_CARDS = [
  {
    titulo: "Qualquer cidade",
    texto: "De São Paulo ao interior do Acre. Onde tem céu, tem sinal.",
  },
  {
    titulo: "Qualquer celular",
    texto: "Funciona em aparelho desbloqueado com suporte a e-SIM. iPhone e Android.",
  },
  {
    titulo: "Ativação em minutos",
    texto: "Escaneia o QR Code que chega no seu e-mail e pronto. Sem ir a loja.",
  },
  {
    titulo: "Zero burocracia",
    texto: "Sem contrato, sem análise de crédito, sem fila, sem vendedor.",
  },
];

const DEPOIMENTOS = [
  {
    nome: "Marcos A.",
    cidade: "Goiânia, GO",
    texto: "Cancelei a antena de R$ 289 e pago R$ 49,90. Nunca mais caiu.",
  },
  {
    nome: "Juliana R.",
    cidade: "Recife, PE",
    texto: "Ativei em 4 minutos no meu iPhone. Não precisei de técnico nem de nada.",
  },
  {
    nome: "Rafael S.",
    cidade: "Sinop, MT",
    texto: "Moro na roça e aqui TIM e Vivo não pegam. O e-SIM funciona perfeito.",
  },
];

const FAQ = [
  {
    pergunta: "É chip físico ou e-SIM?",
    resposta:
      "É um e-SIM digital. Você recebe um QR Code por e-mail, escaneia e ativa no próprio celular. Não precisa ir a loja nem esperar entrega.",
  },
  {
    pergunta: "Precisa de antena?",
    resposta:
      "Não. Nada de prato, cabo, furo na parede ou técnico. É só o e-SIM dentro do seu celular.",
  },
  {
    pergunta: "Funciona com qualquer operadora?",
    resposta:
      "Não depende de operadora nenhuma. O Starlink E-Sim usa rede própria de satélite, então funciona mesmo onde Vivo, TIM, Claro e Oi não têm sinal.",
  },
  {
    pergunta: "Tem fidelidade?",
    resposta: "Não. Você cancela quando quiser, sem multa e sem burocracia.",
  },
  {
    pergunta: "Qual a velocidade?",
    resposta:
      "4G/5G conforme a cobertura local. Em áreas rurais a velocidade é estável para navegar, assistir e trabalhar.",
  },
  {
    pergunta: "Posso usar no roteador?",
    resposta: "Sim. O hotspot é liberado nos planos TURBO e ILIMITADO.",
  },
  {
    pergunta: "Como cancelo?",
    resposta: "Em 1 clique no painel. Sem ligação, sem retenção, sem novela.",
  },
];

function Logo({ tamanho = "h-7" }: { tamanho?: string }) {
  const [falhou, setFalhou] = useState(false);

  if (falhou) {
    return (
      <span className="text-[13px] font-extrabold tracking-[0.2em] text-black">
        STARLINK
      </span>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Starlink E-Sim"
      className={`${tamanho} w-auto object-contain`}
      onError={() => setFalhou(true)}
    />
  );
}

export default function Home() {
  const router = useRouter();
  const [aberto, setAberto] = useState<number | null>(0);
  const [rolado, setRolado] = useState(false);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function aoRolar() {
      setRolado(window.scrollY > 40);
    }
    window.addEventListener("scroll", aoRolar);
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
          }
        });
      },
      { threshold: 0.12 }
    );

    refs.current.forEach((el) => {
      if (el) observador.observe(el);
    });

    return () => observador.disconnect();
  }, []);

  function contratar(planoId: string) {
    router.push(`/checkout?plano=${planoId}`);
  }

  function registrarRef(indice: number) {
    return (el: HTMLDivElement | null) => {
      refs.current[indice] = el;
    };
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#08090B] text-white">
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          rolado
            ? "border-white/10 bg-[#08090B]/95 shadow-lg backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-10 items-center rounded-lg bg-white px-3 transition-transform duration-300 hover:scale-105">
              <Logo />
            </div>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 sm:block">
              E-Sim
            </span>
          </a>
          <button
            onClick={() => contratar("turbo")}
            className="rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#1d4ed8] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]"
          >
            Quero meu e-SIM
          </button>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.35),_transparent_60%)]" />
        <div className="anim-float absolute -right-20 top-20 h-72 w-72 rounded-full bg-[#2563EB]/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#60A5FA]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <span className="anim-fade-up inline-block rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#60A5FA]">
            Internet por satélite · e-SIM
          </span>

          <h1 className="anim-fade-up delay-1 mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
            CANCELOU A ANTENA.
            <br />
            <span className="texto-brilho">A INTERNET FICOU.</span>
          </h1>

          <p className="anim-fade-up delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            O Starlink E-Sim é um <strong className="text-white">e-SIM</strong> — um chip
            digital que já vem dentro do seu celular, sem precisar de cartão físico. Você ativa
            por QR Code em minutos e navega em qualquer lugar do Brasil. Sem antena, sem técnico,
            sem fidelidade.
          </p>

          <div className="anim-fade-up delay-3 mt-4 flex items-start gap-2 text-sm text-[#60A5FA]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mt-0.5 h-4 w-4 shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
            <span>
              e-SIM = chip virtual. Nada de ir à loja, nada de esperar entrega, nada de furar a
              parede.
            </span>
          </div>

          <div className="anim-fade-up delay-4 mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => contratar("turbo")}
              className="anim-glow rounded-full bg-[#2563EB] px-8 py-4 text-base font-extrabold text-white transition-transform duration-300 hover:scale-105"
            >
              Quero meu e-SIM agora
            </button>
            <a
              href="#planos"
              className="rounded-full border border-white/20 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:border-white/50"
            >
              Ver planos
            </a>
          </div>

          <div className="anim-fade-up delay-5 mt-10 flex flex-wrap gap-2">
            {["Sem antena", "Sem instalação", "Sem fidelidade", "Ativa em 5 minutos", "e-SIM"].map(
              (s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition-colors duration-300 hover:border-[#2563EB]/50 hover:text-white"
                >
                  {s}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0E1013] py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div ref={registrarRef(0)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              A verdade que ninguém te conta
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div
              ref={registrarRef(1)}
              className="reveal rounded-2xl border border-red-500/30 bg-red-500/5 p-8 transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="text-sm font-black uppercase tracking-wider text-red-400">
                Vivo · TIM · Claro · Oi
              </h3>
              <ul className="mt-6 space-y-3">
                {COMPARATIVO_RUIM.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                    <span className="mt-0.5 font-black text-red-500">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              ref={registrarRef(2)}
              className="reveal rounded-2xl border border-[#2563EB]/40 bg-[#2563EB]/5 p-8 shadow-[0_0_40px_rgba(37,99,235,0.15)] transition-transform duration-300 hover:-translate-y-1"
            >
              <h3 className="text-sm font-black uppercase tracking-wider text-[#60A5FA]">
                Starlink E-Sim
              </h3>
              <ul className="mt-6 space-y-3">
                {COMPARATIVO_BOM.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/90">
                    <span className="mt-0.5 font-black text-[#2563EB]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div ref={registrarRef(3)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              VIVO, TIM, CLARO E OI NÃO VÃO TE CONTAR ISSO
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-white/60">
              Elas não são ruins por acaso. O modelo de negócio delas depende de você ficar preso.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {OPERADORAS.map((op, i) => (
              <div
                key={op.nome}
                ref={registrarRef(4 + i)}
                className="reveal rounded-2xl border border-white/10 bg-[#14171C] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40"
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-red-500">✕</span>
                  <h3 className="text-lg font-black tracking-tight">{op.nome}</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {op.acusacoes.map((a) => (
                    <li key={a} className="text-sm leading-relaxed text-white/60">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            ref={registrarRef(8)}
            className="reveal mt-10 rounded-2xl border border-[#2563EB]/40 bg-[#2563EB]/5 p-8"
          >
            <p className="text-lg leading-relaxed text-white/90">
              Enquanto elas brigam por quem te prende melhor, o Starlink E-Sim resolve em 5
              minutos com um e-SIM que funciona em qualquer lugar do Brasil. Sem antena, sem
              técnico, sem fidelidade, sem multa. Você paga R$ 49,90 e usa o mês inteiro. Elas
              cobram R$ 289 e te limitam a 5GB.{" "}
              <strong className="text-white">Não é concorrência. É outro século.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0E1013] py-20">
        <div className="mx-auto max-w-5xl px-5">
          <div ref={registrarRef(9)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              Como funciona
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Escolha seu plano",
                d: "START, TURBO ou ILIMITADO. Sem contrato e sem análise de crédito.",
              },
              {
                n: "2",
                t: "Pague no PIX",
                d: "QR Code na hora. Pagamento confirmado em segundos.",
              },
              {
                n: "3",
                t: "Ative o e-SIM",
                d: "Receba o QR Code do e-SIM por e-mail e ative em minutos. Funciona em qualquer lugar do Brasil.",
              },
            ].map((p, i) => (
              <div
                key={p.n}
                ref={registrarRef(10 + i)}
                className="reveal rounded-2xl border border-white/10 bg-[#14171C] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB] text-xl font-black transition-transform duration-300 hover:scale-110">
                  {p.n}
                </div>
                <h3 className="mt-5 text-lg font-bold">{p.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div ref={registrarRef(13)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              UM E-SIM. O BRASIL INTEIRO.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-center leading-relaxed text-white/60">
              Não é chip físico. Não precisa ir a loja. Não depende de antena. É um e-SIM digital
              que ativa no seu celular e conecta em qualquer lugar do Brasil — capital, interior,
              praia, serra, fazenda ou estrada.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {ESIM_CARDS.map((c, i) => (
              <div
                key={c.titulo}
                ref={registrarRef(14 + i)}
                className="reveal rounded-2xl border border-white/10 bg-[#14171C] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/50"
              >
                <h3 className="text-base font-bold text-[#60A5FA]">{c.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.texto}</p>
              </div>
            ))}
          </div>

          <div
            ref={registrarRef(18)}
            className="reveal mt-10 rounded-2xl border border-[#2563EB]/40 bg-[#2563EB]/5 p-8"
          >
            <p className="text-lg leading-relaxed text-white/90">
              Enquanto a operadora te obriga a esperar 15 dias por um técnico, você ativa o
              Starlink E-Sim em 5 minutos e navega de qualquer lugar do país.
            </p>
          </div>
        </div>
      </section>

      <section id="planos" className="border-y border-white/10 bg-[#0E1013] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div ref={registrarRef(19)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              Escolha seu plano
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-white/60">
              Sem fidelidade. Sem taxa de instalação. Cancela quando quiser.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANOS.map((p, i) => (
              <div
                key={p.id}
                ref={registrarRef(20 + i)}
                className={`reveal relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-2 ${
                  p.destaque
                    ? "border-[#2563EB] bg-[#14171C] shadow-[0_0_50px_rgba(37,99,235,0.3)]"
                    : "border-white/10 bg-[#14171C] hover:border-white/25"
                }`}
              >
                {p.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-4 py-1 text-[11px] font-black uppercase tracking-wider">
                    Mais escolhido
                  </span>
                )}

                <h3 className="text-sm font-black uppercase tracking-wider text-white/50">
                  {p.nome}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-black">
                    R$ {p.preco.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-sm text-white/50">/mês</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#60A5FA]">
                  e-SIM incluso · funciona em todo o Brasil
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/60">{p.descricao}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {p.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="mt-0.5 font-black text-[#2563EB]">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => contratar(p.id)}
                  className={`mt-8 w-full rounded-full py-4 text-sm font-extrabold transition-all duration-300 hover:scale-105 ${
                    p.destaque
                      ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                      : "border border-white/20 text-white hover:border-white/50"
                  }`}
                >
                  Assinar {p.nome}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div ref={registrarRef(23)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              Por que o ILIMITADO é outro nível
            </h2>
            <div className="mt-8 rounded-2xl border border-[#2563EB]/40 bg-[#2563EB]/5 p-8">
              <p className="text-lg leading-relaxed text-white/90">
                Enquanto a operadora te vende 5GB e te cobra R$ 80 pelo excedente, aqui você paga
                R$ 49,90 e usa o mês inteiro. Sem letra miúda. Sem &quot;velocidade reduzida após
                o limite&quot;. Sem surpresa na fatura.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Internet 100% ilimitada",
                  "Sem redução de velocidade",
                  "Hotspot liberado",
                  "Prioridade na rede",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="font-black text-[#2563EB]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0E1013] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div ref={registrarRef(24)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              Quem já cancelou a antena
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {DEPOIMENTOS.map((d, i) => (
              <div
                key={d.nome}
                ref={registrarRef(25 + i)}
                className="reveal rounded-2xl border border-white/10 bg-[#14171C] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/50"
              >
                <div className="flex gap-0.5 text-[#2563EB]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  &quot;{d.texto}&quot;
                </p>
                <p className="mt-4 text-xs font-bold text-white/50">
                  {d.nome} · {d.cidade}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <div
            ref={registrarRef(28)}
            className="reveal rounded-2xl border border-[#2563EB]/40 bg-[#2563EB]/5 p-10"
          >
            <h2 className="text-2xl font-black md:text-3xl">7 dias de garantia</h2>
            <p className="mt-3 text-white/70">
              Não funcionou no seu aparelho? Devolvemos 100% do valor. Sem pergunta, sem
              burocracia.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0E1013] py-20">
        <div className="mx-auto max-w-3xl px-5">
          <div ref={registrarRef(29)} className="reveal">
            <h2 className="text-center text-3xl font-black tracking-tight md:text-4xl">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={item.pergunta}
                className={`overflow-hidden rounded-xl border bg-[#14171C] transition-all duration-300 ${
                  aberto === i ? "border-[#2563EB]/50" : "border-white/10"
                }`}
              >
                <button
                  onClick={() => setAberto(aberto === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-bold">{item.pergunta}</span>
                  <span className="text-xl font-bold text-[#2563EB]">
                    {aberto === i ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    aberto === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-white/70">
                      {item.resposta}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#2563EB] py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <div className="anim-float mx-auto mb-8 flex h-14 w-fit items-center rounded-lg bg-white px-4">
            <Logo tamanho="h-9" />
          </div>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl">
            A antena te prende. O e-SIM te liberta.
          </h2>
          <button
            onClick={() => contratar("turbo")}
            className="mt-10 rounded-full bg-white px-12 py-5 text-lg font-extrabold text-[#2563EB] shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-blue-50"
          >
            Quero meu e-SIM agora
          </button>
        </div>
      </section>

      <footer className="bg-[#08090B] py-14">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <div className="mx-auto flex h-12 w-fit items-center rounded-lg bg-white px-3">
            <Logo tamanho="h-8" />
          </div>
          <p className="mt-4 text-sm font-bold text-white/70">Starlink E-Sim</p>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm font-semibold text-white/50">
            <a href="#" className="transition-colors hover:text-white">
              Termos
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Privacidade
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Contato
            </a>
          </div>
          <p className="mt-8 text-xs text-white/30">
            Página demonstrativa. CNPJ 00.000.000/0001-00
          </p>
        </div>
      </footer>
    </main>
  );
}
