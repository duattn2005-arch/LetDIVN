import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Newspaper, Check, FileText, Upload, Loader2 } from 'lucide-react';
import { MediaCoverageEntry } from '../types';
import { ImageUploadWidget } from './ImageUploadWidget';
import { dbService } from '../services/dbService';

interface MediaCoverageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: MediaCoverageEntry | null;
  onSave: (item: Omit<MediaCoverageEntry, 'id'> | MediaCoverageEntry) => void;
}

export const MediaCoverageEditorModal: React.FC<MediaCoverageEditorModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [articleCount, setArticleCount] = useState('0');
  const [segmentCount, setSegmentCount] = useState('0');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setImage(itemToEdit.image || '');
      setArticleCount(String(itemToEdit.articleCount ?? 0));
      setSegmentCount(String(itemToEdit.segmentCount ?? 0));
      setPdfUrl(itemToEdit.pdfUrl || '');
    } else {
      setTitle('');
      setImage('');
      setArticleCount('0');
      setSegmentCount('0');
      setPdfUrl('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePdfFileChange = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }
    setIsUploadingPdf(true);
    try {
      const url = await dbService.uploadFile(file);
      setPdfUrl(url);
    } catch (err: any) {
      alert(err?.message || 'Failed to upload the PDF. Please try again.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title (e.g. World Cleanup Day 2026)!');
      return;
    }
    if (!pdfUrl.trim()) {
      alert('Please upload or paste a link to the press-coverage PDF!');
      return;
    }

    const payload = {
      ...(itemToEdit ? { id: itemToEdit.id } : {}),
      title: title.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
      articleCount: Math.max(0, parseInt(articleCount, 10) || 0),
      segmentCount: Math.max(0, parseInt(segmentCount, 10) || 0),
      pdfUrl: pdfUrl.trim(),
    };

    onSave(payload as any);
    onClose();
  };

  return typeof document !== 'undefined'
    ? createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#E81A7F]" />
                  <span>{itemToEdit ? 'Edit Press Coverage Entry (Admin)' : 'Add New Press Coverage Entry (Admin)'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Each entry is one campaign/year, with counts and a PDF listing the press coverage
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Title (button label) *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. World Cleanup Day 2026"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                />
              </div>

              {/* Article & Segment counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Article count</label>
                  <input
                    type="number"
                    min={0}
                    value={articleCount}
                    onChange={(e) => setArticleCount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Segment count</label>
                  <input
                    type="number"
                    min={0}
                    value={segmentCount}
                    onChange={(e) => setSegmentCount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Image */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Cover image</label>
                <ImageUploadWidget currentImageUrl={image} onImageSelected={(url) => setImage(url)} label="" />
              </div>

              {/* PDF Upload */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Press coverage PDF *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="Paste a PDF link or upload a file..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-[#E81A7F] focus:ring-2 focus:ring-[#E81A7F]/20 transition-all outline-none"
                  />
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) handlePdfFileChange(e.target.files[0]);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={isUploadingPdf}
                    className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isUploadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                  </button>
                </div>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View current PDF</span>
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{itemToEdit ? 'Save Changes' : 'Add New Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
};
