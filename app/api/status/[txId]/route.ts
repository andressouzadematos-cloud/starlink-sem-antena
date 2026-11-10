import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  contexto: { params?: { txId?: string } }
) {
  const txId = contexto?.params?.txId;

  if (!txId) {
    return NextResponse.json({ error: "txId obrigatório." }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("pedidos")
      .select("status, valor_centavos, plano, pago_em")
      .eq("tx_id", txId)
      .maybeSingle();

    if (error) {
      console.error("Erro ao consultar status:", JSON.stringify(error));
      return NextResponse.json({ error: "Erro ao consultar status." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ status: "nao_encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      status: data.status,
      valor: data.valor_centavos / 100,
      plano: data.plano,
      pagoEm: data.pago_em,
    });
  } catch (erro) {
    console.error("Exceção ao consultar status:", erro);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
