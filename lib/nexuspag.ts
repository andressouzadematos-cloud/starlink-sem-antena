const BASE = "https://nexuspag.com";
const API_KEY = "nxp_live_4736d2b79e61399be24c13e8a9e60d65bf4b810a85cacf1c8dbb10959bc1a6e8";

type ErroApi = { status: number; body: unknown };

const RETENTAVEIS = new Set([429, 500, 502, 503]);

export async function chamarNexus<T>(
  caminho: string,
  init: RequestInit = {},
  tentativas = 4
): Promise<T> {
  let ultimoErro: ErroApi | null = null;

  for (let i = 0; i < tentativas; i++) {
    const resposta = await fetch(`${BASE}${caminho}`, {
      ...init,
      headers: {
        "x-api-key": API_KEY,
        "content-type": "application/json",
        ...(init.headers || {}),
      },
    });

    if (resposta.ok) return (await resposta.json()) as T;

    const body = await resposta.json().catch(() => null);
    ultimoErro = { status: resposta.status, body };

    if (!RETENTAVEIS.has(resposta.status) || i === tentativas - 1) break;

    const espera = Math.min(1000 * 2 ** i, 8000) + Math.random() * 300;
    await new Promise((r) => setTimeout(r, espera));
  }

  throw ultimoErro;
}