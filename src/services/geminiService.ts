import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY});

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

export interface AntibioticOption {
  antibiotic: string;
  dosage: string;
  duration: string;
  reliabilityScore: number; // Percentage 0-100
  reasoning: string;
}

export interface AntibioticRecommendation {
  options: AntibioticOption[];
  globalReasoning: string;
  warnings: string[];
}

export async function getAntibioticRecommendation(input: RecommendationInput): Promise<AntibioticRecommendation> {
  const prompt = `
    En tant qu'assistant expert en maladies infectieuses et antibiothérapie, fournis jusqu'à 3 recommandations d'antibiothérapie (classées par pertinence/fiabilité) basées sur les données suivantes :
    - Âge : ${input.ageDays} jours
    - Sexe : ${input.sex}
    - Poids : ${input.weightKg} kg
    - Antécédents : ${input.history}
    - Diagnostic initial (fourni par l'utilisateur) : ${input.diagnosis}
    - Identification du pathogène (si disponible) : ${input.identification}

    ${input.document ? "Un document médical a été joint. Analyse-le PRIORITAIREMENT pour extraire des données biologiques, imagerie ou résultats de culture afin d'affiner les recommandations." : "Aucun document supplémentaire n'est joint."}

    Pour chaque option (maximum 3), indique : le nom de l'antibiotique, le dosage calculé, la durée, et un score de fiabilité (0-100%) basé sur l'adéquation aux guides de pratique clinique.
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
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                antibiotic: { type: Type.STRING },
                dosage: { type: Type.STRING },
                duration: { type: Type.STRING },
                reliabilityScore: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              },
              required: ["antibiotic", "dosage", "duration", "reliabilityScore", "reasoning"]
            }
          },
          globalReasoning: { type: Type.STRING },
          warnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["options", "globalReasoning", "warnings"]
      },
      systemInstruction: "Tu es un expert médical spécialisé dans l'antibiothérapie. Tu analyses les documents médicaux pour proposer de 1 à 3 options de traitement antibiotique. Pour chaque option, tu calcules le dosage et estimes un score de fiabilité (en pourcentage) par rapport aux standards internationaux (WHO/IDSA). Mentionne qu'il s'agit d'une aide à la décision."
    }
  });

  if (!response.text) {
    throw new Error("No recommendation received from AI");
  }

  return JSON.parse(response.text.trim()) as AntibioticRecommendation;
}
