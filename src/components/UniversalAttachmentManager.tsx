import React, { useState, useRef } from 'react';
import { 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  File, 
  Link as LinkIcon, 
  Trash2, 
  Plus, 
  ExternalLink, 
  Mic, 
  Square, 
  Check, 
  Download, 
  Eye, 
  Edit2, 
  X,
  Play,
  Pause
} from 'lucide-react';
import { FileAttachment } from '../types';
import { useAppContext } from '../context/AppContext';

interface UniversalAttachmentManagerProps {
  attachments: FileAttachment[];
  onChange: (attachments: FileAttachment[]) => void;
  title?: string;
  readOnly?: boolean;
}

export const UniversalAttachmentManager: React.FC<UniversalAttachmentManagerProps> = ({
  attachments = [],
  onChange,
  title = 'Attachments & Reference Media',
  readOnly = false
}) => {
  const { theme } = useAppContext();
  const isLight = theme === 'light';

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  const [editingAttachment, setEditingAttachment] = useState<FileAttachment | null>(null);
  const [previewMedia, setPreviewMedia] = useState<FileAttachment | null>(null);

  // File Upload Handler (Handles text, audio, video, pictures, docx, pdf)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      let determinedType = 'file';
      if (file.type.startsWith('image/')) determinedType = 'image';
      else if (file.type.startsWith('audio/')) determinedType = 'audio';
      else if (file.type.startsWith('video/')) determinedType = 'video';
      else if (file.type.includes('pdf') || ext === 'pdf') determinedType = 'pdf';
      else if (file.type.includes('word') || ext === 'doc' || ext === 'docx') determinedType = 'word';
      else if (file.type.includes('text') || ext === 'txt' || ext === 'md' || ext === 'csv') determinedType = 'text';

      reader.onload = (event) => {
        const result = event.target?.result as string;
        const newAttachment: FileAttachment = {
          id: 'att_' + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: determinedType,
          url: result || URL.createObjectURL(file),
          size: file.size,
          description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
        };
        onChange([...attachments, newAttachment]);
      };

      if (determinedType === 'text') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Link / URL Handler
  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    const cleanUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl.trim() 
      : `https://${linkUrl.trim()}`;

    const newAttachment: FileAttachment = {
      id: 'att_' + Math.random().toString(36).substr(2, 9),
      name: linkTitle.trim() || cleanUrl,
      type: 'link',
      url: cleanUrl,
      size: 0,
      description: 'Web Reference / Lecture Link'
    };

    onChange([...attachments, newAttachment]);
    setLinkUrl('');
    setLinkTitle('');
    setShowLinkModal(false);
  };

  // Live Voice Recording Handler
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newAttachment: FileAttachment = {
            id: 'att_' + Math.random().toString(36).substr(2, 9),
            name: `Voice Note (${timestamp})`,
            type: 'audio',
            url: base64Audio,
            size: audioBlob.size,
            description: 'Recorded Student Voice Mnemonic'
          };
          onChange([...attachments, newAttachment]);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable:', err);
      alert('Microphone access is needed to record voice notes. Please allow microphone permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Delete Attachment
  const handleDelete = (id: string) => {
    onChange(attachments.filter(a => a.id !== id));
  };

  // Save Edit Attachment Name / Description
  const handleSaveEdit = () => {
    if (!editingAttachment) return;
    onChange(attachments.map(a => a.id === editingAttachment.id ? editingAttachment : a));
    setEditingAttachment(null);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={14} className="text-emerald-500 shrink-0" />;
      case 'audio': return <Music size={14} className="text-violet-500 shrink-0" />;
      case 'video': return <Video size={14} className="text-rose-500 shrink-0" />;
      case 'pdf': return <FileText size={14} className="text-red-500 shrink-0" />;
      case 'word': return <FileText size={14} className="text-blue-500 shrink-0" />;
      case 'link': return <LinkIcon size={14} className="text-amber-500 shrink-0" />;
      default: return <File size={14} className="text-orange-500 shrink-0" />;
    }
  };

  return (
    <div className={`rounded-2xl border p-4 space-y-3 transition-colors ${
      isLight ? 'bg-orange-50/40 border-orange-200' : 'bg-[#1a1614] border-[#3f332c]'
    }`}>
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Paperclip size={15} className="text-orange-500" />
          <span className={`text-xs font-black uppercase tracking-wider ${
            isLight ? 'text-stone-900' : 'text-orange-100'
          }`}>
            {title} ({attachments.length})
          </span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Upload File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                isLight 
                  ? 'bg-white hover:bg-orange-100 text-stone-900 border-orange-300' 
                  : 'bg-[#2a221f] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
              }`}
              title="Upload PDF, Word document, Image, Video, Audio, or Text file"
            >
              <Plus size={13} className="text-orange-500" />
              <span>Upload File / PDF / Doc</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.md,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Voice Recorder Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                isRecording 
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse' 
                  : isLight 
                    ? 'bg-white hover:bg-orange-100 text-stone-900 border-orange-300' 
                    : 'bg-[#2a221f] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
              }`}
              title="Record voice note or oral memory trigger"
            >
              {isRecording ? <Square size={13} /> : <Mic size={13} className="text-rose-500" />}
              <span>{isRecording ? `Stop (${recordingSeconds}s)` : 'Record Voice'}</span>
            </button>

            {/* Add Link Button */}
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                isLight 
                  ? 'bg-white hover:bg-orange-100 text-stone-900 border-orange-300' 
                  : 'bg-[#2a221f] hover:bg-[#342a27] text-orange-200 border-[#3f332c]'
              }`}
              title="Add web reference, article or YouTube link"
            >
              <LinkIcon size={13} className="text-amber-500" />
              <span>Add Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Attachment List */}
      {attachments.length === 0 ? (
        <p className={`text-[11px] italic py-1 ${isLight ? 'text-stone-600' : 'text-orange-200/50'}`}>
          No attachments added yet. You can attach PDFs, Word docs, photos, voice notes, video clips, and study links.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {attachments.map(att => (
            <div
              key={att.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                isLight ? 'bg-white border-orange-200' : 'bg-[#241c19] border-[#3f332c]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getMediaIcon(att.type)}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${isLight ? 'text-stone-900' : 'text-orange-100'}`}>
                    {att.name}
                  </p>
                  {att.description && (
                    <p className={`text-[10px] truncate ${isLight ? 'text-stone-600' : 'text-orange-200/50'}`}>
                      {att.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* View / Play */}
                <button
                  type="button"
                  onClick={() => setPreviewMedia(att)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isLight ? 'hover:bg-orange-100 text-stone-800 border-orange-200' : 'hover:bg-[#3f332c] text-orange-200 border-[#3f332c]'
                  }`}
                  title="View / Play media"
                >
                  <Eye size={12} />
                </button>

                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditingAttachment(att)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-orange-100 text-stone-800 border-orange-200' : 'hover:bg-[#3f332c] text-orange-200 border-[#3f332c]'
                      }`}
                      title="Edit attachment name"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(att.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete attachment"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewMedia && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className={`max-w-2xl w-full rounded-3xl border p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl ${
              isLight ? 'bg-white border-orange-300 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-orange-100'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-[#3f332c]/30">
              <div className="flex items-center gap-2">
                {getMediaIcon(previewMedia.type)}
                <h3 className="font-black text-sm uppercase tracking-wide truncate max-w-md">{previewMedia.name}</h3>
              </div>
              <button 
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Render Preview by Type */}
            <div className="flex flex-col items-center justify-center p-2">
              {previewMedia.type === 'image' && (
                <img 
                  src={previewMedia.url} 
                  alt={previewMedia.name} 
                  className="max-h-[60vh] rounded-2xl object-contain border border-orange-500/20"
                />
              )}

              {previewMedia.type === 'audio' && (
                <div className="w-full py-6 flex flex-col items-center space-y-3">
                  <Music size={48} className="text-violet-500 animate-pulse" />
                  <audio controls src={previewMedia.url} className="w-full max-w-md" autoPlay />
                </div>
              )}

              {previewMedia.type === 'video' && (
                <video controls src={previewMedia.url} className="max-h-[60vh] w-full rounded-2xl border" autoPlay />
              )}

              {previewMedia.type === 'link' && (
                <div className="text-center py-6 space-y-4">
                  <LinkIcon size={40} className="mx-auto text-amber-500" />
                  <p className="text-xs font-mono text-orange-300 break-all">{previewMedia.url}</p>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {(previewMedia.type === 'pdf' || previewMedia.type === 'word' || previewMedia.type === 'file' || previewMedia.type === 'text') && (
                <div className="text-center py-6 space-y-4">
                  <FileText size={48} className="mx-auto text-orange-500" />
                  <p className="text-xs font-medium text-stone-600 dark:text-orange-200/70">
                    File ready for review or download.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={previewMedia.url}
                      download={previewMedia.name}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      <Download size={14} />
                      <span>Download File</span>
                    </a>
                    {previewMedia.url.startsWith('http') && (
                      <a
                        href={previewMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black/10 dark:bg-white/10 rounded-xl text-xs font-bold"
                      >
                        <ExternalLink size={14} />
                        <span>Open Document</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Attachment Modal */}
      {editingAttachment && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          onClick={() => setEditingAttachment(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className={`max-w-md w-full rounded-3xl border p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-orange-300 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-orange-100'
            }`}
          >
            <h3 className="font-black text-sm uppercase tracking-wide">Edit Attachment Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1">Attachment Title</label>
                <input
                  type="text"
                  value={editingAttachment.name}
                  onChange={e => setEditingAttachment({ ...editingAttachment, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl text-xs border font-bold ${
                    isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={editingAttachment.description || ''}
                  onChange={e => setEditingAttachment({ ...editingAttachment, description: e.target.value })}
                  placeholder="e.g. Chapter 4 diagram, audio rhyme"
                  className={`w-full p-2.5 rounded-xl text-xs border font-medium ${
                    isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAttachment(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-transparent hover:bg-black/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Modal */}
      {showLinkModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          onClick={() => setShowLinkModal(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className={`max-w-md w-full rounded-3xl border p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-orange-300 text-stone-900' : 'bg-[#2a221f] border-[#3f332c] text-orange-100'
            }`}
          >
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <LinkIcon size={16} className="text-amber-500" />
              <span>Attach Web Link or Video Reference</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1">Web URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/topic-notes or youtube link"
                  className={`w-full p-2.5 rounded-xl text-xs border font-mono ${
                    isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider block mb-1">Display Label</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={e => setLinkTitle(e.target.value)}
                  placeholder="e.g. Lecture Video, Reference Article"
                  className={`w-full p-2.5 rounded-xl text-xs border font-bold ${
                    isLight ? 'bg-orange-50 border-orange-200 text-stone-900' : 'bg-[#1a1614] border-[#3f332c] text-orange-100'
                  }`}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-transparent hover:bg-black/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLink}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Attach Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
