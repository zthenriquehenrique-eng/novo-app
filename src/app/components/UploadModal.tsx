'use client';

import { useState, useRef } from 'react';
import { X, Upload, Loader2, Camera, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;

    try {
      setAnalyzing(true);

      // Analyze with OpenAI
      const analysisResponse = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: preview }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze meal');
      }

      const analysis = await analysisResponse.json();

      setAnalyzing(false);
      setUploading(true);

      // Upload image to Supabase Storage
      const fileName = `${userId}/${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('meal-images').getPublicUrl(fileName);

      // Save meal to database
      const { error: insertError } = await supabase.from('meals').insert({
        user_id: userId,
        image_url: publicUrl,
        foods: analysis.foods,
        total_calories: analysis.total_calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
      });

      if (insertError) throw insertError;

      setUploading(false);
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error uploading meal:', error);
      alert('Erro ao processar refeição. Tente novamente.');
      setAnalyzing(false);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview('');
    setAnalyzing(false);
    setUploading(false);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Nova Refeição
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            disabled={analyzing || uploading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Fotografe sua refeição
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Clique para selecionar uma foto da galeria
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30">
                <Upload className="w-5 h-5" />
                Selecionar Foto
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                {!analyzing && !uploading && !success && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview('');
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                )}
              </div>

              {/* Status */}
              {analyzing && (
                <div className="flex items-center justify-center gap-3 p-6 bg-blue-50 rounded-2xl">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="text-blue-900 font-medium">
                    Analisando refeição com IA...
                  </span>
                </div>
              )}

              {uploading && (
                <div className="flex items-center justify-center gap-3 p-6 bg-emerald-50 rounded-2xl">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  <span className="text-emerald-900 font-medium">
                    Salvando refeição...
                  </span>
                </div>
              )}

              {success && (
                <div className="flex items-center justify-center gap-3 p-6 bg-emerald-50 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="text-emerald-900 font-medium">
                    Refeição registrada com sucesso!
                  </span>
                </div>
              )}

              {/* Actions */}
              {!analyzing && !uploading && !success && (
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
                  >
                    Analisar e Salvar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
