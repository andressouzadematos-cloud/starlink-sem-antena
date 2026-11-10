import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createHmac, timingSafeEqual } from "crypto";

const WEBHOOK_SECRET = "COLE_AQUI_O_WEBHOOK_SECRET_DO_PAINEL";
const TOLERANCIA_SEGUNDOS = 300;

function assinaturaValida(corpoCru: string, header: string | null): boolean {
  if (!header) return false;

  const partes = Object.fromEntries(
    header.split(",").map((p) => p.split("=") as [string, string])
  );

  const timestamp = Number(partes.t);
  const assinatura = partes.v1;

  if (!timestamp || !assinatura) return false;

  const agora = Math.floor(Date.now() / 1000);
  if (Math.abs(agora - timestamp) > TOLERANCIA_SEGUNDOS) return false;

  const esperado = createHmac("sha256", WEBHOOK_SECRET)
    .update(`${timestamp}.${corpoCru}`)
    .digest("hex");

  const a = Buffer.from(esperado, "utf8");
  const b = Buffer.from(assinatura, "utf8");

  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const corpoCru = await req.text();

  if (!assinaturaValida(corpoCru, req.headers.get("x-webhook-signature"))) {
    console.warn("Webhook com assinatura inválida.");
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  try {
    const evento = req.headers.get("x-webhook-event") || "";
    const payload = JSON.parse(corpoCru);

    if (evento !== "payment.confirmed") {
      return NextResponse.json({ ok: true });
    }

    const txId = payload?.transaction_id;
    if (!txId) return NextResponse.json({ ok: true });

    await getSupabaseAdmin()
      .from("pedidos")
      .update({
        status: "paid",
        pago_em: payload?.paid_at || new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq("tx_id", txId);

    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("Erro no webhook:", erro);
    return NextResponse.json({ ok: true });
  }
}