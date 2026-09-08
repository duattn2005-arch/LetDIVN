import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Link, Check, AlertCircle, Loader2 } from 'lucide-react';
import { dbService } from '../services/dbService';

interface ImageUploadWidgetProps {
  currentImageUrl?: string;
  onImageSelected: (base64OrUrl: string) => void;
  label?: string;
  aspectRatioLabel?: string;
  placeholderText?: string;
}

export const ImageUploadWidget: React.FC<ImageUploadWidgetProps> = ({
  currentImageUrl,
  onImageSelected,
  label = 'Tải ảnh lên từ máy tính hoặc nhập liên kết',
  aspectRatioLabel = 'Khuyên dùng tỉ lệ 16:9 hoặc 4:3 (JPG, PNG, WebP)',
  placeholderText = 'https://...'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'paste'>('upload');
  const [urlInput, setUrlInput] = useState(currentImageUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | Blob) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG, WebP, GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Show an instant local preview while the real upload (which returns a
    // permanent server URL — images are stored as real files now, not
    // base64 blobs) happens in the background.
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);
    try {
      const url = await dbService.uploadFile(file);
      setPreviewUrl(url);
      onImageSelected(url);
    } catch (err: any) {
      setError(err?.message || 'Tải ảnh lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // Clipboard Paste Support (Ctrl + V from browser or clipboard)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileChange(file);
          e.preventDefault();
          return;
        }
      }
    }

    // Text URL pasted
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && (pastedText.startsWith('http://') || pastedText.startsWith('https://') || pastedText.startsWith('data:image/'))) {
      setUrlInput(pastedText.trim());
      setPreviewUrl(pastedText.trim());
      onImageSelected(pastedText.trim());
      setError(null);
    }
  };

  const handlePasteFromClipboardBtn = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            handleFileChange(blob);
            return;
          }
        }
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
          setUrlInput(text.trim());
          setPreviewUrl(text.trim());
          onImageSelected(text.trim());
          setError(null);
          return;
        }
      }
    } catch {
      setError('Hãy nhấn phím Ctrl + V trực tiếp để dán ảnh đã copy.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setError('Vui lòng nhập đường link ảnh hợp lệ');
      return;
    }
    setError(null);
    setPreviewUrl(urlInput.trim());
    onImageSelected(urlInput.trim());
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    setUrlInput('');
    onImageSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2" onPaste={handlePaste}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300">{label}</label>
          <span className="text-[11px] text-slate-400">{aspectRatioLabel}</span>
        </div>
      )}

      {/* Mode selection: Local Upload vs Paste vs URL */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
            activeMode === 'upload'
              ? 'bg-white dark:bg-slate-700 text-[#E81A7F] shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span>Tải tệp lên</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('paste')}
          className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
            activeMode === 'paste'
              ? 'bg-white dark:bg-slate-700 text-[#E81A7F] shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <span>📋 Dán (Ctrl+V)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('url')}
          className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all cursor-pointer text-[11px] ${
            activeMode === 'url'
              ? 'bg-white dark:bg-slate-700 text-[#E81A7F] shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Link className="w-3.5 h-3.5 shrink-0" />
          <span>Gắn link ảnh</span>
        </button>
      </div>

      {/* Upload Zone */}
      {activeMode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#E81A7F] bg-pink-50/50 dark:bg-pink-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-[#E81A7F] hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center py-2 text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-950/40 text-[#E81A7F] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold">
              <span className="text-[#E81A7F] font-bold">Nhấn để chọn ảnh</span> hoặc kéo thả file vào đây
            </div>
            <p className="text-[10px] text-slate-400">Hỗ trợ PNG, JPG, JPEG, WEBP tối đa 5MB</p>
          </div>
        </div>
      )}

      {/* Paste Zone */}
      {activeMode === 'paste' && (
        <div
          onClick={handlePasteFromClipboardBtn}
          tabIndex={0}
          onPaste={handlePaste}
          className="border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-50 rounded-2xl p-4 text-center cursor-pointer transition-all focus:ring-2 focus:ring-purple-400 focus:outline-hidden"
        >
          <div className="flex flex-col items-center justify-center py-2 text-purple-800 space-y-1.5">
            <div className="text-2xl">📋</div>
            <div className="text-xs font-bold text-purple-900">
              Nhấn vào đây rồi bấm <kbd className="px-1.5 py-0.5 bg-white border border-purple-300 rounded font-mono text-[11px]">Ctrl + V</kbd> để dán ảnh
            </div>
            <p className="text-[10px] text-purple-600">Hoặc click để tự động dán ảnh từ bộ nhớ tạm (Clipboard)</p>
          </div>
        </div>
      )}

      {/* URL Input Zone */}
      {activeMode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder={placeholderText}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onPaste={handlePaste}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#E81A7F]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Áp dụng</span>
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview Box */}
      {previewUrl && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-36 object-cover"
            onError={() => setError('Không thể tải ảnh từ đường dẫn đã cung cấp')}
          />
          <button
            type="button"
            onClick={handleClearImage}
            title="Xóa ảnh"
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1.5">
            {isUploading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <span>✓ Đã tải ảnh thành công</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


