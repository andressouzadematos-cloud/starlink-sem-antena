import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

type PayloadWebhook = {
  event?: string;
  type?: string;
  status?: string;
  data?: {
    id?: string;
    txid?: string;
    transaction_id?: string;
    status?: string;
    amount?: number;
    paid_at?: string;
  };
  transaction?: {
    id?: string;
    txid?: string;
    status?: string;
    amount?: number;
    paid_at?: string;
  };
};

function extrairTxId(payload: PayloadWebhook): string | null {
  return (
    payload?.data?.id ||
    payload?.data?.txid ||
    payload?.data?.transaction_id ||
    payload?.transaction?.id ||
    payload?.transaction?.txid ||
    null
  );
}

function extrairStatus(payload: PayloadWebhook): string | null {
  return payload?.data?.status || payload?.transaction?.status || payload?.status || null;
}

function assinaturaValida(corpoBruto: string, assinatura: string | null): boolean {
  const segredo = process.env.NEXUSPAG_WEBHOOK_SECRET;

  if (!segredo) {
    console.error("NEXUSPAG_WEBHOOK_SECRET não configurado.");
    return false;
  }

  if (!assinatura) {
    console.error("Requisição sem header de assinatura.");
    return false;
  }

  const esperado = createHmac("sha256", segredo).update(corpoBruto).digest("hex");

  const recebido = assinatura.replace(/^sha256=/, "").trim();

  if (recebido.length !== esperado.length) return false;

  try {
    return timingSafeEqual(Buffer.from(recebido, "hex"), Buffer.from(esperado, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const corpoBruto = await req.text();

  const assinatura =
    req.headers.get("x-nexuspag-signature") ||
    req.headers.get("x-signature") ||
    req.headers.get("x-webhook-signature");

  if (!assinaturaValida(corpoBruto, assinatura)) {
    console.error("Webhook com assinatura inválida.");
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let payload: PayloadWebhook;

  try {
    payload = JSON.parse(corpoBruto);
  } catch {
    console.error("Webhook com JSON inválido.");
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const txId = extrairTxId(payload);
  const status = extrairStatus(payload);

  console.log("Webhook recebido:", { txId, status, evento: payload?.event || payload?.type });

  if (!txId) {
    console.error("Webhook sem txId identificável:", corpoBruto);
    return NextResponse.json({ error: "txId ausente." }, { status: 400 });
  }

  const statusNormalizado = String(status || "").toLowerCase();

  const pago = ["paid", "approved", "completed", "confirmed", "succeeded", "pago", "aprovado"].includes(
    statusNormalizado
  );

  const falhou = ["failed", "refused", "canceled", "cancelled", "expired", "rejected"].includes(
    statusNormalizado
  );

  const novoStatus = pago ? "paid" : falhou ? "failed" : "pending";

  try {
    const supabase = getSupabaseAdmin();

    const { data: pedido, error: erroBusca } = await supabase
      .from("pedidos")
      .select("tx_id, status, valor_centavos")
      .eq("tx_id", txId)
      .maybeSingle();

    if (erroBusca) {
      console.error("Erro ao buscar pedido:", JSON.stringify(erroBusca));
      return NextResponse.json({ error: "Erro ao buscar pedido." }, { status: 500 });
    }

    if (!pedido) {
      console.error("Pedido não encontrado para txId:", txId);
      return NextResponse.json({ received: true, aviso: "Pedido não encontrado." }, { status: 200 });
    }

    if (pedido.status === "paid" && novoStatus === "paid") {
      console.log("Pedido já estava pago, ignorando duplicata:", txId);
      return NextResponse.json({ received: true, duplicado: true }, { status: 200 });
    }

    const atualizacao: Record<string, unknown> = {
      status: novoStatus,
      atualizado_em: new Date().toISOString(),
    };

    if (novoStatus === "paid") {
      atualizacao.pago_em = payload?.data?.paid_at || payload?.transaction?.paid_at || new Date().toISOString();
    }

    const { error: erroUpdate } = await supabase
      .from("pedidos")
      .update(atualizacao)
      .eq("tx_id", txId);

    if (erroUpdate) {
      console.error("Erro ao atualizar pedido:", JSON.stringify(erroUpdate));
      return NextResponse.json({ error: "Erro ao atualizar pedido." }, { status: 500 });
    }

    console.log("Pedido atualizado:", { txId, de: pedido.status, para: novoStatus });

    return NextResponse.json({ received: true, status: novoStatus }, { status: 200 });
  } catch (erro) {
    console.error("Exceção no webhook:", erro);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, rota: "webhook" }, { status: 200 });
}
