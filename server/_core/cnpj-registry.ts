import { cleanCNPJ, isValidCNPJ } from "./cnpj-validator";

export type CnpjRegistryRecord = {
  cnpj: string;
  legalName: string;
  tradeName: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  status: string;
};

export class CnpjRegistryError extends Error {
  constructor(
    message: string,
    public readonly kind: "invalid" | "not_found" | "inactive" | "unavailable",
  ) {
    super(message);
    this.name = "CnpjRegistryError";
  }
}

type BrasilApiCnpj = {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string | null;
  descricao_situacao_cadastral?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string | null;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  ddd_telefone_1?: string | null;
  email?: string | null;
};

export async function lookupActiveCnpj(value: string): Promise<CnpjRegistryRecord> {
  const cnpj = cleanCNPJ(value);
  if (!isValidCNPJ(cnpj)) {
    throw new CnpjRegistryError("O CNPJ informado é inválido.", "invalid");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (response.status === 404) {
      throw new CnpjRegistryError("O CNPJ não foi encontrado na base consultada.", "not_found");
    }
    if (!response.ok) {
      throw new CnpjRegistryError("Não foi possível consultar o CNPJ agora. Tente novamente.", "unavailable");
    }

    const data = (await response.json()) as BrasilApiCnpj;
    const status = data.descricao_situacao_cadastral?.trim().toUpperCase() ?? "DESCONHECIDA";
    if (status !== "ATIVA") {
      throw new CnpjRegistryError(`O CNPJ está com situação cadastral ${status}.`, "inactive");
    }

    const address = [
      [data.logradouro, data.numero].filter(Boolean).join(", "),
      data.complemento ?? "",
      [data.bairro, data.municipio, data.uf].filter(Boolean).join(" · "),
      data.cep ? `CEP ${data.cep}` : "",
    ]
      .filter(Boolean)
      .join(" — ");

    return {
      cnpj,
      legalName: data.razao_social?.trim() || "Empresa sem razão social informada",
      tradeName: data.nome_fantasia?.trim() || null,
      address,
      phone: data.ddd_telefone_1?.trim() || null,
      email: data.email?.trim().toLowerCase() || null,
      status,
    };
  } catch (error) {
    if (error instanceof CnpjRegistryError) throw error;
    throw new CnpjRegistryError("Não foi possível consultar o CNPJ agora. Tente novamente.", "unavailable");
  } finally {
    clearTimeout(timeout);
  }
}
