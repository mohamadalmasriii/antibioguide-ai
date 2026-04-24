import { GoogleGenAI, Type } from "@google/genai";

const apiKey ="AIzaSyBgDb0NzCo4bbUNBMTUe4nI24Z0FmrNcR8";

const ai = new GoogleGenAI({ apiKey });
console.log("API KEY =", apiKey);

interface RecommendationInput {
  ageDays: number;
  sex: string;
  weightKg: number;
  history: string;
  diagnosis: string;
  identification: string;
  document?: {
    data: string; // base64
    mimeType: string;
  };
}

export interface AntibioticRecommendation {
  antibiotic: string;
  dosage: string;
  duration: string;
  reasoning: string;
  warnings: string[];
}

export async function getAntibioticRecommendation(input: RecommendationInput): Promise<AntibioticRecommendation> {
  const prompt = `
    En tant qu'assistant expert en maladies infectieuses et antibiothérapie, fournis une recommandation d'antibiothérapie précise basée sur les données suivantes :
    - Âge : ${input.ageDays} jours
    - Sexe : ${input.sex}
    - Poids : ${input.weightKg} kg
    - Antécédents : ${input.history}
    - Diagnostic initial (fourni par l'utilisateur) : ${input.diagnosis}
    - Identification du pathogène (si disponible) : ${input.identification}

    ${input.document ? "Un document médical (compte-rendu, analyse biologique ou imagerie) a été joint. Analyse-le PRIORITAIREMENT pour affiner le diagnostic et déterminer la sensibilité bactérienne probable." : "Aucun document supplémentaire n'est joint."}

    La recommandation doit inclure le nom de l'antibiotique, le dosage précis calculé (souvent en mg/kg/jour ou dose fixe selon l'âge/poids), la durée du traitement et une justification médicale basée sur le diagnostic établi (avec l'aide du document si présent).
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (input.document) {
    parts.push({
      inlineData: {
        data: input.document.data,
        mimeType: input.document.mimeType
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          antibiotic: { type: Type.STRING },
          dosage: { type: Type.STRING },
          duration: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          warnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["antibiotic", "dosage", "duration", "reasoning", "warnings"]
      },
      systemInstruction: "Tu es un expert médical spécialisé dans l'antibiothérapie. Tu analyses les documents médicaux joints pour confirmer un diagnostic et proposer le meilleur traitement antibiotique selon les recommandations internationales. Mentionne toujours qu'il s'agit d'une aide à la décision."
    }
  });

  if (!response.text) {
    throw new Error("No recommendation received from AI");
  }

  return JSON.parse(response.text.trim()) as AntibioticRecommendation;
}
