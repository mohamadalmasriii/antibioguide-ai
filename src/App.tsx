/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Stethoscope, 
  Baby, 
  Weight, 
  History, 
  Search, 
  ShieldAlert, 
  ClipboardCheck, 
  Clock, 
  Pill,
  Send,
  Loader2,
  AlertTriangle,
  ChevronRight,
  User,
  FileUp,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAntibioticRecommendation, type AntibioticRecommendation } from './services/geminiService';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AntibioticRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    ageDays: '',
    sex: 'H',
    weightKg: '',
    history: '',
    diagnosis: '',
    identification: ''
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      let documentData = undefined;
      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        // Remove the data URI prefix (e.g., "data:image/png;base64,")
        const base64Data = base64.split(',')[1];
        documentData = {
          data: base64Data,
          mimeType: selectedFile.type
        };
      }

      const result = await getAntibioticRecommendation({
        ageDays: Number(formData.ageDays),
        sex: formData.sex === 'H' ? 'Homme' : 'Femme',
        weightKg: Number(formData.weightKg),
        history: formData.history,
        diagnosis: formData.diagnosis,
        identification: formData.identification,
        document: documentData
      });
      setRecommendation(result);
    } catch (err) {
      console.error(err);
      setError("Désolé, une erreur est survenue lors de la génération de la recommandation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#3B82F6] p-2 rounded-lg">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-[#0F172A]">AntibioGuide AI</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Professionnels de santé seulement</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-12 xl:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <ClipboardCheck className="text-[#3B82F6] w-5 h-5" />
                <h2 className="text-lg font-semibold text-[#0F172A]">Profil et Diagnostic Patient</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Age */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                      <Baby className="w-3 h-3" /> Âge (jours)
                    </label>
                    <input
                      required
                      type="number"
                      name="ageDays"
                      value={formData.ageDays}
                      onChange={handleInputChange}
                      placeholder="Ex: 28"
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] outline-none transition-all"
                    />
                  </div>

                  {/* Sexe */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                      <User className="w-3 h-3" /> Sexe
                    </label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] outline-none transition-all appearance-none"
                    >
                      <option value="H">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </div>

                  {/* Poids */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                      <Weight className="w-3 h-3" /> Poids (Kg)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      name="weightKg"
                      value={formData.weightKg}
                      onChange={handleInputChange}
                      placeholder="Ex: 3.5"
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Antecedents */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                    <History className="w-3 h-3" /> Antécédents
                  </label>
                  <textarea
                    name="history"
                    value={formData.history}
                    onChange={handleInputChange}
                    placeholder="Allergies, pathologies chroniques, traitements en cours..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] outline-none transition-all resize-none"
                  />
                </div>

                {/* Diagnostic */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                    <Search className="w-3 h-3" /> Diagnostic / Diagnostic suspecté
                  </label>
                  <input
                    required
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Ex: Méningite bactérienne suspectée"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] outline-none transition-all"
                  />
                </div>

                {/* Identification & File Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                      Identification du Pathogène
                    </label>
                    <input
                      type="text"
                      name="identification"
                      value={formData.identification}
                      onChange={handleInputChange}
                      placeholder="Ex: E. coli, Klebsiella..."
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-2">
                      <FileUp className="w-3 h-3" /> Document Médical (PDF, Image)
                    </label>
                    <div className="relative group">
                      {!selectedFile ? (
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full px-4 py-2.5 bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] rounded-xl text-center group-hover:border-[#3B82F6] transition-colors">
                            <span className="text-xs text-[#64748B] group-hover:text-[#3B82F6]">
                               Joindre un document contextuel
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-4 py-2.5 bg-[#EFF6FF] border border-[#3B82F6] rounded-xl">
                          <span className="text-xs font-medium text-[#1D4ED8] truncate max-w-[200px]">
                            {selectedFile.name}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="p-1 hover:bg-[#DBEAFE] rounded-full text-[#1D4ED8] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#94A3B8] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      Obtenir la Recommandation
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-12 xl:col-span-5">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center text-center space-y-4 shadow-sm"
                >
                  <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Traitement des données</h3>
                    <p className="text-[#64748B] text-sm">Nous analysons les protocoles cliniques pour vous fournir la meilleure recommandation...</p>
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex gap-4"
                >
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              ) : recommendation ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                    <div className="bg-[#3B82F6] px-6 py-4 flex items-center gap-3">
                      <Pill className="text-white w-5 h-5" />
                      <h3 className="text-white font-bold uppercase tracking-wider text-sm">Plan de Traitement</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] block mb-1">Antibiotique</span>
                          <p className="text-lg font-bold text-[#3B82F6]">{recommendation.antibiotic}</p>
                        </div>
                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] block mb-1">Dosage</span>
                          <p className="text-base font-semibold">{recommendation.dosage}</p>
                        </div>
                        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] block mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Durée Totale
                          </span>
                          <p className="text-base font-semibold">{recommendation.duration}</p>
                        </div>
                      </div>

                      <div className="border-t border-[#E2E8F0] pt-6">
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4 text-[#3B82F6]" /> Justification Médicale
                        </h4>
                        <p className="text-sm text-[#475569] leading-relaxed italic">
                          "{recommendation.reasoning}"
                        </p>
                      </div>

                      {recommendation.warnings.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Vigilance & Surveillance
                          </h4>
                          <ul className="space-y-1.5">
                            {recommendation.warnings.map((warn, i) => (
                              <li key={i} className="text-xs text-amber-900 flex gap-2">
                                <span className="text-amber-500">•</span>
                                {warn}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#F1F5F9] rounded-xl p-4 flex gap-3 items-start">
                    <ShieldAlert className="w-5 h-5 text-[#64748B] shrink-0" />
                    <p className="text-[10px] text-[#64748B] uppercase leading-tight font-medium">
                      AVERTISSEMENT : Cette application est un outil d'aide à la décision utilisant l'I.A. 
                      Les recommandations doivent être validées par un médecin senior. AntibioGuide AI ne remplace pas 
                      le jugement clinique ni les guides locaux.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-[#F1F5F9] border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#E2E8F0] rounded-full flex items-center justify-center opacity-50">
                    <Pill className="w-8 h-8 text-[#94A3B8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#94A3B8]">En attente de données</h3>
                    <p className="text-[#94A3B8] text-sm">Remplissez le formulaire à gauche pour générer un plan de traitement personnalisé.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-[#E2E8F0] mt-auto">
        <p className="text-center text-[#94A3B8] text-xs">
          Built with Gemini AI &middot; Aide à la décision clinique &middot; 2026
        </p>
      </footer>
    </div>
  );
}
