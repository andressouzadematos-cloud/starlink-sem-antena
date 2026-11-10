import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { chamarNexus } from "@/lib/nexuspag";
import { randomUUID } from "crypto";

const PLANOS: Record<string, { valor: number; nome: string }> = {
  start: { valor: 24.9, nome: "START" },
  turbo: { valor: 34.9, nome: "TURBO" },
  ilimitado: { valor: 49.9, nome: "ILIMITADO" },
};

type RespostaPix = {
  success: boolean;
  transaction: {
    id: string;
    txid: string;
    external_id: string | null;
    amount: number;
    net_amount: number;
    status: string;
    pix_copia_cola: string;
    qr_code_base64: string;
    expires_at: string;
  };
};

export async function POST(req: Request) {
  try {
    const { nome, email, documento, telefone, plano, marca, modelo } = await req.json();

    if (!nome || !email || !documento || !telefone || !plano) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    const planoEscolhido = PLANOS[String(plano).toLowerCase()];

    if (!planoEscolhido) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const doc = String(documento).replace(/\D/g, "");
    const tel = String(telefone).replace(/\D/g, "");

    if (doc.length !== 11 && doc.length !== 14) {
      return NextResponse.json({ error: "CPF ou CNPJ inválido." }, { status: 400 });
    }

    if (tel.length < 10 || tel.length > 11) {
      return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const externalId = `pedido-${randomUUID()}`;

    console.log("Criando PIX na NexusPag:", {
      valor: planoEscolhido.valor,
      plano: planoEscolhido.nome,
      externalId,
    });

    const dados = await chamarNexus<RespostaPix>("/api/pix/create", {
      method: "POST",
      body: JSON.stringify({
        amount: planoEscolhido.valor,
        description: `Starlink Sem Antena - ${planoEscolhido.nome}`,
        external_id: externalId,
        webhook_url: `${siteUrl}/api/webhook`,
        expiration: 1800,
      }),
    });

    const tx = dados.transaction;

    if (!tx?.id) {
      console.error("NexusPag resposta sem id:", JSON.stringify(dados));
      return NextResponse.json(
        { error: "Resposta inesperada do provedor de pagamento." },
        { status: 502 }
      );
    }

    console.log("PIX criado na NexusPag:", tx.id);

    try {
      const { error: erroBanco } = await getSupabaseAdmin().from("pedidos").insert({
        tx_id: tx.id,
        external_id: externalId,
        plano: planoEscolhido.nome,
        nome,
        email,
        documento: doc,
        telefone: tel,
        aparelho_marca: marca || null,
        aparelho_modelo: modelo || null,
        valor_centavos: Math.round(planoEscolhido.valor * 100),
        status: "pending",
        metodo: "pix",
        qr_code: tx.qr_code_base64,
        qr_code_texto: tx.pix_copia_cola,
      });

      if (erroBanco) {
        console.error("Erro ao salvar no Supabase:", JSON.stringify(erroBanco));
        return NextResponse.json(
          {
            error: `Erro ao salvar pedido: ${erroBanco.message || erroBanco.code || "desconhecido"}`,
          },
          { status: 500 }
        );
      }

      console.log("Pedido salvo no Supabase:", tx.id);
    } catch (erroDb) {
      console.error("Exceção ao salvar no Supabase:", erroDb);
      return NextResponse.json(
        {
          error: `Erro ao salvar pedido: ${
            erroDb instanceof Error ? erroDb.message : "desconhecido"
          }`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      txId: tx.id,
      qrCode: tx.qr_code_base64,
      qrCodeTexto: tx.pix_copia_cola,
      valor: planoEscolhido.valor,
      plano: planoEscolhido.nome,
    });
  } catch (erro) {
    const e = erro as { status?: number; body?: unknown; message?: string };
    console.error("Erro no checkout:", JSON.stringify(erro));

    if (e?.status === 401) {
      return NextResponse.json(
        { error: "Chave da NexusPag inválida ou sem permissão." },
        { status: 500 }
      );
    }

    if (e?.status === 429) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns segundos." },
        { status: 429 }
      );
    }

    if (e?.status === 400) {
      const detalhe =
        (e?.body as { message?: string; error?: string })?.message ||
        (e?.body as { message?: string; error?: string })?.error ||
        "Dados rejeitados pela NexusPag.";
      return NextResponse.json({ error: detalhe }, { status: 400 });
    }

    const detalhe =
      (e?.body as { message?: string; error?: string })?.message ||
      (e?.body as { message?: string; error?: string })?.error ||
      e?.message ||
      "Erro interno ao processar o pedido.";

    return NextResponse.json({ error: detalhe }, { status: 500 });
  }
}
