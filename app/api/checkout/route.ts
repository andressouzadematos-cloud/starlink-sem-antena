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
    const { nome, email, documento, telefone, plano } = await req.json();

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
    const externalId = `plano-${planoEscolhido.nome.toLowerCase()}-${randomUUID()}`;

    const dados = await chamarNexus<RespostaPix>("/api/pix/create", {
      method: "POST",
      body: JSON.stringify({
        amount: planoEscolhido.valor,
        description: `Starlink Sem Antena - Plano ${planoEscolhido.nome}`,
        external_id: externalId,
        webhook_url: `${siteUrl}/api/webhook`,
        expiration: 1800,
      }),
    });

    const tx = dados.transaction;

    if (!tx?.id) {
      console.error("NexusPag resposta sem id:", JSON.stringify(dados));
      return NextResponse.json({ error: "Resposta inesperada do provedor." }, { status: 502 });
    }

    await getSupabaseAdmin().from("pedidos").insert({
      tx_id: tx.id,
      external_id: externalId,
      plano: planoEscolhido.nome,
      nome,
      email,
      documento: doc,
      telefone: tel,
      valor_centavos: Math.round(planoEscolhido.valor * 100),
      status: "pending",
      metodo: "pix",
      qr_code: tx.qr_code_base64,
      qr_code_texto: tx.pix_copia_cola,
    });

    return NextResponse.json({
      txId: tx.id,
      qrCode: tx.qr_code_base64,
      qrCodeTexto: tx.pix_copia_cola,
      valor: planoEscolhido.valor,
      plano: planoEscolhido.nome,
    });
  } catch (erro) {
    const e = erro as { status?: number; body?: unknown };
    console.error("Erro no checkout:", JSON.stringify(e));

    if (e?.status === 401) {
      return NextResponse.json({ error: "Pagamento indisponível no momento." }, { status: 500 });
    }

    if (e?.status === 429) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns segundos." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "Erro interno ao processar o pedido." }, { status: 500 });
  }
}