import { GoogleGenAI, Type } from "@google/genai";

<<<<<<< HEAD
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY});
=======
const apiKey ="AIzaSyBgDb0NzCo4bbUNBMTUe4nI24Z0FmrNcR8";

const ai = new GoogleGenAI({ apiKey });
console.log("API KEY =", apiKey);
>>>>>>> adbe850814ef6dcebb7e36d9244e57d820685932

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

<<<<<<< HEAD
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
=======
export interface AntibioticRecommendation {
  antibiotic: string;
  dosage: string;
  duration: string;
  reasoning: string;
>>>>>>> adbe850814ef6dcebb7e36d9244e57d820685932
  warnings: string[];
}

export async function getAntibioticRecommendation(input: RecommendationInput): Promise<AntibioticRecommendation> {
  const prompt = `
<<<<<<< HEAD
    En tant qu'assistant expert en maladies infectieuses et antibiothérapie, fournis jusqu'à 3 recommandations d'antibiothérapie (classées par pertinence/fiabilité) basées sur les données suivantes :
=======
    En tant qu'assistant expert en maladies infectieuses et antibiothérapie, fournis une recommandation d'antibiothérapie précise basée sur les données suivantes :
>>>>>>> adbe850814ef6dcebb7e36d9244e57d820685932
    - Âge : ${input.ageDays} jours
    - Sexe : ${input.sex}
    - Poids : ${input.weightKg} kg
    - Antécédents : ${input.history}
    - Diagnostic initial (fourni par l'utilisateur) : ${input.diagnosis}
    - Identification du pathogène (si disponible) : ${input.identification}

<<<<<<< HEAD
    ${input.document ? "Un document médical a été joint. Analyse-le PRIORITAIREMENT pour extraire des données biologiques, imagerie ou résultats de culture afin d'affiner les recommandations." : "Aucun document supplémentaire n'est joint."}

    Pour chaque option (maximum 3), indique : le nom de l'antibiotique, le dosage calculé, la durée, et un score de fiabilité (0-100%) basé sur l'adéquation aux guides de pratique clinique.
=======
    ${input.document ? "Un document médical (compte-rendu, analyse biologique ou imagerie) a été joint. Analyse-le PRIORITAIREMENT pour affiner le diagnostic et déterminer la sensibilité bactérienne probable." : "Aucun document supplémentaire n'est joint."}

    La recommandation doit inclure le nom de l'antibiotique, le dosage précis calculé (souvent en mg/kg/jour ou dose fixe selon l'âge/poids), la durée du traitement et une justification médicale basée sur le diagnostic établi (avec l'aide du document si présent).
>>>>>>> adbe850814ef6dcebb7e36d9244e57d820685932
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
<<<<<<< HEAD
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
=======
          antibiotic: { type: Type.STRING },
          dosage: { type: Type.STRING },
          duration: { type: Type.STRING },
          reasoning: { type: Type.STRING },
>>>>>>> adbe850814ef6dcebb7e36d9244e57d820685932
          warnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
<<<<<<< HEAD
        required: ["options", "globalReasoning", "warnings"]
      },
      systemInstruction: "Tu es un expert médical spécialisé dans l'antibiothérapie. Tu analyses les documents médicaux pour proposer de 1 à 3 options de traitement antibiotique. Pour chaque option, tu calcules le dosage et estimes un score de fiabilité (en pourcentage) par rapport aux standards internationaux (WHO/IDSA). Mentionne qu'il s'agit d'une aide à la décision."
=======
        required: ["antibiotic", "dosage", "duration", "reasoning", "warnings"]
      },
      systemInstruction: "Tu es un expert médical spécialisé dans l'antibiothérapie. Tu analyses les documents médicaux joints pour confirmer un diagnostic et proposer le meilleur traitement antibiotique selon les recommandations internationales. Mentionne toujours qu'il s'agit d'une aide à la décision."
>>>>>>> adbe850814ef6dcebb7e36d9244e57d820685932
    }
  });

  if (!response.text) {
    throw new Error("No recommendation received from AI");
  }

  return JSON.parse(response.text.trim()) as AntibioticRecommendation;
}
