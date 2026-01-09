import { GoogleGenAI } from "@google/genai";
import { Coordinates } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MODEL_ID = "gemini-2.5-flash";

/**
 * Searches for places using Gemini with Google Maps Grounding.
 */
export const searchPlaces = async (
  query: string, 
  location?: Coordinates
): Promise<{ text: string; chunks?: any[] }> => {
  
  try {
    const prompt = `
      Atue como um assistente de prospecção de clientes chamado AlphaClients.
      
      Tarefa: Localize empresas, lojas ou serviços correspondentes a: "${query}".
      
      Contexto de Localização: ${location ? `Latitude: ${location.latitude}, Longitude: ${location.longitude}` : "Use a localização geral baseada na query ou padrão global"}.
      
      IMPORTANTE - FORMATO DE SAÍDA:
      Você deve listar os resultados encontrados. Para cada resultado, gere EXATAMENTE uma linha seguindo este padrão (separado por duas barras verticais '||'):
      {Link Completo do Google Maps} || {Nome exato do local} || {Telefone} || {Infos Completas}

      Regras de Formatação:
      1. Use EXATAMENTE "||" como separador. NÃO use apenas uma barra "/".
      2. O Link deve ser o URL completo (começando com https://).
      3. Se não encontrar telefone, escreva "S/ Tel".
      
      Regras de Conteúdo ({Infos Completas}):
      - INCLUA O ENDEREÇO COMPLETO (Rua, Número, Bairro, CEP, Cidade, Estado).
      - INCLUA NOTA E AVALIAÇÕES (Ex: 4.8 ⭐ (120 reviews)).
      - CRUCIAL: Liste os HORÁRIOS DE FUNCIONAMENTO COMPLETOS para todos os dias da semana disponíveis (Segunda a Domingo). Seja extenso.
      - Se houver site, inclua no final das infos.

      Exemplo de Saída Esperada:
      https://maps.google.com/?cid=123456 || Padaria Central || (11) 9999-9999 || Rua das Flores, 123, Centro, SP. 4.5 ⭐ (50 reviews). Seg-Sex: 08:00-18:00, Sáb: 09:00-13:00, Dom: Fechado.
    `;

    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (location) {
      config.toolConfig = {
        google_search_retrieval: {}
      };
    }

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: config,
    });

    const text = response.text || "Nenhum resultado textual encontrado.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, chunks };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Falha ao conectar com o serviço AlphaClients.");
  }
};

/**
 * Refines the existing results based on user instruction.
 */
export const refineResults = async (
  currentData: string,
  instruction: string
): Promise<string> => {
  try {
    const prompt = `
      Atue como o AlphaClients AI Refiner.
      Você recebeu uma lista de leads prospectados.
      
      Lista Atual:
      ${currentData}
      
      Instrução do usuário para modificação/filtro: 
      "${instruction}"
      
      TAREFA:
      1. Analise a lista atual.
      2. Aplique as modificações pedidas (ex: filtrar por nota, remover sem telefone, traduzir, reformatar, deixar mais curto, etc).
      3. Se a instrução pedir para buscar coisas NOVAS que não estão na lista, avise que você só pode modificar a lista atual, mas tente fazer o melhor possível com o que tem.
      4. Mantenha o formato de saída OBRIGATÓRIO:
         {Link Completo} || {Nome} || {Telefone} || {Infos}
      
      Retorne apenas a nova lista processada.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      // No tools needed for refinement, just text processing
    });

    return response.text || currentData;

  } catch (error: any) {
    console.error("Refinement Error:", error);
    throw new Error("Falha ao refinar os resultados.");
  }
};