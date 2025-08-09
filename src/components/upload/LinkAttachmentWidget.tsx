// src/components/upload/LinkAttachmentWidget.tsx
'use client';

import React, { useState } from 'react';
import { Plus, X, Link, AlertCircle, ExternalLink } from 'lucide-react';

interface LinkAttachmentWidgetProps {
  links: { name: string; url: string }[];
  onLinksChange: (links: { name: string; url: string }[]) => void;
  label?: string;
  description?: string;
}

const LinkAttachmentWidget: React.FC<LinkAttachmentWidgetProps> = ({
  links,
  onLinksChange,
  label = "Lampiran Link",
  description = "Tambahkan link sebagai lampiran"
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '' });
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLink = () => {
    setError(null);
    
    if (!newLink.name.trim()) {
      setError('Nama link tidak boleh kosong');
      return;
    }
    
    if (!newLink.url.trim()) {
      setError('URL tidak boleh kosong');
      return;
    }
    
    if (!validateUrl(newLink.url)) {
      setError('URL tidak valid. Pastikan URL dimulai dengan http:// atau https://');
      return;
    }
    
    const updatedLinks = [...links, { ...newLink }];
    onLinksChange(updatedLinks);
    setNewLink({ name: '', url: '' });
    setIsAdding(false);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    onLinksChange(updatedLinks);
  };

  const handleCancel = () => {
    setNewLink({ name: '', url: '' });
    setIsAdding(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        
        {description && (
          <p className="text-sm text-gray-500 mb-3">{description}</p>
        )}

        {/* Add Link Button */}
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Link
          </button>
        )}

        {/* Add Link Form */}
        {isAdding && (
          <div className="p-4 border border-gray-300 rounded-md bg-gray-50 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Link
              </label>
              <input
                type="text"
                value={newLink.name}
                onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Panduan Tugas, Materi Tambahan"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Link
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/file-atau-halaman"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Link List */}
      {links.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Link Terlampir:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {links.map((link, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Link className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{link.name}</p>
                    <p className="text-xs text-blue-600 truncate">{link.url}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(link.url, '_blank')}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Buka link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    title="Hapus link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkAttachmentWidget;
