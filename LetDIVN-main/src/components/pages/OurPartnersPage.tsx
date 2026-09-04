import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Partner } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sparkles, 
  Building2, 
  ExternalLink, 
  Handshake, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Globe, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft, 
  ArrowRight, 
  Move, 
  Sliders,
  RotateCcw
} from 'lucide-react';
import { PartnerEditorModal } from '../PartnerEditorModal';
import { EditableText } from '../EditableText';

export const OurPartnersPage: React.FC<{ onBecomePartner: () => void }> = ({ onBecomePartner }) => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  const ourPartnersDescAfterBrand = (t.ourPartnersDesc || '').replace("Let's do it! Vietnam", '').trim();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Global display & resize preferences
  const [globalScale, setGlobalScale] = useState<number>(100);
  const [gridColumns, setGridColumns] = useState<number>(5);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const loadPartners = () => {
    dbService.getPartners().then(setPartners);
  };

  useEffect(() => {
    loadPartners();
    const unsub = dbService.subscribe(loadPartners);
    return () => unsub();
  }, []);

  const handleAddNew = () => {
    setSelectedPartner(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsEditorOpen(true);
  };

  const handleDelete = (partner: Partner) => {
    if (window.confirm(language === 'vi' ? `Bạn có chắc chắn muốn xóa đối tác "${partner.name}"?` : `Are you sure you want to delete partner "${partner.name}"?`)) {
      dbService.deletePartner(partner.id);
      loadPartners();
    }
  };

  // Drag and Drop reordering logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const fromIndex = partners.findIndex(p => p.id === draggedId);
    const toIndex = partners.findIndex(p => p.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const updated = [...partners];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setPartners(updated);
      dbService.savePartners(updated);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Step Move Left / Right
  const handleMove = (id: string, direction: 'left' | 'right') => {
    const idx = partners.findIndex(p => p.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= partners.length) return;

    const updated = [...partners];
    const [item] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, item);
    setPartners(updated);
    dbService.savePartners(updated);
  };

  // Individual Logo Zoom
  const handleScaleDelta = (id: string, delta: number) => {
    const partner = partners.find(p => p.id === id);
    if (!partner) return;
    const currentScale = partner.scale || 100;
    const newScale = Math.min(180, Math.max(50, currentScale + delta));
    dbService.updatePartner(id, { scale: newScale });
    loadPartners();
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="ourPartners.title"
            defaultValue={t.ourPartnersTitle || (language === 'vi' ? 'Đối Tác & Nhà Tài Trợ' : 'Our Partners & Sponsors')}
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]">
            <span className="whitespace-nowrap font-bold text-slate-800">Let's do it! Vietnam</span>{' '}
            <EditableText
              contentKey="ourPartners.subtitle"
              defaultValue={ourPartnersDescAfterBrand || (language === 'vi' ? 'tự hào nhận được sự đồng hành, bảo trợ và tài trợ từ các tổ chức tiên phong.' : 'is proud to be accompanied and supported by visionary partners and sponsors.')}
              as="span"
            />
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBecomePartner}
              className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm px-8 py-3 rounded-full shadow-lg transition-all cursor-pointer"
            >
              <EditableText contentKey="ourPartners.becomePartnerBtn" defaultValue="Become a Partner" as="span" />
            </button>

            {isAdmin && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner / Sponsor</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Resize & Drag-and-Drop Control Bar */}
        {isAdmin && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Move className="w-4 h-4 text-[#E81A7F]" />
              <span>🖐 Drag and drop any logo to reposition it</span>
            </div>

            <div className="flex flex-wrap items-center gap-5">
              {/* Global Zoom Slider */}
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">🔍 Zoom all:</span>
                <input
                  type="range"
                  min="70"
                  max="140"
                  step="5"
                  value={globalScale}
                  onChange={(e) => setGlobalScale(Number(e.target.value))}
                  className="w-28 accent-[#E81A7F] cursor-pointer"
                />
                <span className="font-mono font-bold text-[#E81A7F] w-9">{globalScale}%</span>
              </div>

              {/* Grid Column Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-semibold">Columns:</span>
                {[3, 4, 5, 6].map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setGridColumns(col)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      gridColumns === col
                        ? 'bg-[#E81A7F] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clean Modern Logo Showcase Grid with Flowing Rainbow Border & Drag & Drop */}
        <div 
          className={`grid gap-6 sm:gap-8 lg:gap-10 items-center justify-items-center py-4 ${
            gridColumns === 3 ? 'grid-cols-2 sm:grid-cols-3' :
            gridColumns === 4 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' :
            gridColumns === 6 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
            'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          }`}
        >
          {partners.map((p, index) => {
            const itemScale = (p.scale || 100) * (globalScale / 100);
            const isBeingDragged = draggedId === p.id;
            const isDragOver = dragOverId === p.id;

            return (
              <div
                key={p.id}
                draggable={isAdmin}
                onDragStart={(e) => handleDragStart(e, p.id)}
                onDragOver={(e) => handleDragOver(e, p.id)}
                onDrop={(e) => handleDrop(e, p.id)}
                onDragEnd={handleDragEnd}
                className={`relative group w-full max-w-[240px] h-32 sm:h-36 rainbow-border-card transition-all duration-200 ${
                  isBeingDragged ? 'opacity-40 scale-95 cursor-grabbing' : 'cursor-grab'
                } ${isDragOver ? 'ring-4 ring-[#E81A7F] ring-offset-2 scale-105' : ''}`}
              >
                {/* Admin Quick Action Floating Buttons on Hover */}
                {isAdmin && (
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-30 bg-white/95 backdrop-blur-md shadow-md border border-slate-200 rounded-lg p-1">
                    {/* Move Left */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMove(p.id, 'left');
                        }}
                        title="Move left"
                        className="p-1 text-slate-600 hover:text-[#E81A7F] rounded transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Move Right */}
                    {index < partners.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMove(p.id, 'right');
                        }}
                        title="Move right"
                        className="p-1 text-slate-600 hover:text-[#E81A7F] rounded transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Zoom In (+) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleScaleDelta(p.id, 10);
                      }}
                      title="Zoom in logo (+10%)"
                      className="p-1 text-slate-600 hover:text-[#E81A7F] rounded transition-colors cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    {/* Zoom Out (-) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleScaleDelta(p.id, -10);
                      }}
                      title="Zoom out logo (-10%)"
                      className="p-1 text-slate-600 hover:text-[#E81A7F] rounded transition-colors cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Modal */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(p);
                      }}
                      title={language === 'vi' ? "Sửa logo & link" : "Edit logo & link"}
                      className="p-1 text-slate-700 hover:text-[#E81A7F] rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(p);
                      }}
                      title={language === 'vi' ? "Xóa đối tác" : "Delete partner"}
                      className="p-1 text-slate-700 hover:text-red-600 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Clickable Logo Inner Container */}
                <div className="rainbow-border-inner overflow-hidden">
                  <a
                    href={p.website || '#'}
                    target={p.website ? "_blank" : undefined}
                    rel="noreferrer"
                    title={`${p.name}${p.website ? ` (Click to open ${p.website})` : ''}`}
                    className="w-full h-full flex items-center justify-center p-2 cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  >
                    <img
                      src={p.logo}
                      alt={p.name}
                      style={{
                        transform: `scale(${itemScale / 100})`,
                        transformOrigin: 'center center'
                      }}
                      className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-200"
                      loading="lazy"
                    />
                  </a>
                </div>

                {/* Company Name & Link Hover Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {p.website && <Globe className="w-3 h-3 text-pink-400" />}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Partner Editor Modal */}
      <PartnerEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        partnerToEdit={selectedPartner}
        onSaved={loadPartners}
      />
    </div>
  );
};


