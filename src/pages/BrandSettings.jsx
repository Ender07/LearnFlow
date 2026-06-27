import React, { useState, useEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useBrand } from '@/components/providers/BrandProvider';
import { base44 } from '@/api/base44Client';
import { Palette, Upload, Save, RotateCcw, CheckCircle2, Building2, Zap } from 'lucide-react';

const PRESETS = [
  { name: 'Electric Blue',  primary: '#00D4FF', secondary: '#7C3AED', bg: '#0A0E1A', sidebar: '#0D1117' },
  { name: 'Emerald Green',  primary: '#10B981', secondary: '#0EA5E9', bg: '#071412', sidebar: '#0A1A17' },
  { name: 'Amber Gold',     primary: '#F59E0B', secondary: '#EF4444', bg: '#12100A', sidebar: '#171208' },
  { name: 'Rose Violet',    primary: '#EC4899', secondary: '#8B5CF6', bg: '#110A14', sidebar: '#150D18' },
  { name: 'Pure White',     primary: '#F8FAFC', secondary: '#94A3B8', bg: '#0A0A0F', sidebar: '#0D0D14' },
];

function ColorSwatch({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
             style={{ border: '1px solid rgba(255,255,255,0.15)', boxShadow: `0 0 12px ${value}44` }}>
          <div className="absolute inset-0" style={{ background: value }} />
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <input
          type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl text-sm font-mono outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
          onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.4)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        />
      </div>
    </div>
  );
}

export default function BrandSettings() {
  const { currentUser } = useData();
  const { brand, refetch } = useBrand();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    company_name:     'LearnFlow',
    logo_url:         '',
    primary_color:    '#00D4FF',
    secondary_color:  '#7C3AED',
    background_color: '#0A0E1A',
    sidebar_color:    '#0D1117',
  });

  useEffect(() => {
    if (brand) setForm({ ...form, ...brand });
  }, [brand]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      set('logo_url', res.file_url);
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.BrandSettings.list();
      if (existing.length > 0) {
        await base44.entities.BrandSettings.update(existing[0].id, form);
      } else {
        await base44.entities.BrandSettings.create(form);
      }
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const applyPreset = (preset) => {
    setForm(f => ({
      ...f,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
      background_color: preset.bg,
      sidebar_color: preset.sidebar,
    }));
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center rounded-2xl p-10" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
               style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Palette className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Admin Only</h3>
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>This area requires administrator privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'hsl(var(--background))' }}>
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.15))', border: '1px solid rgba(0,212,255,0.25)' }}>
              <Palette className="w-5 h-5" style={{ color: '#00D4FF' }} />
            </div>
            Branding & Theme
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            Customize the visual identity of your LearnFlow instance
          </p>
        </div>

        {/* Company Identity */}
        <div className="rounded-2xl p-6 space-y-6"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4" style={{ color: '#00D4FF' }} />
            <span className="text-white font-semibold">Company Identity</span>
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Company Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Zap className="w-8 h-8" style={{ color: '#00D4FF' }} />
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                       style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Upload Logo'}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>PNG, SVG or WebP · Recommended 256×256</p>
              </div>
            </div>
          </div>

          {/* Company name */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Company Name</label>
            <input
              value={form.company_name} onChange={e => set('company_name', e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="rounded-2xl p-6 space-y-6"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4" style={{ color: '#7C3AED' }} />
            <span className="text-white font-semibold">Color Palette</span>
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button key={preset.name} onClick={() => applyPreset(preset)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = preset.primary + '55'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: preset.primary }} />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorSwatch label="Primary Accent" value={form.primary_color} onChange={v => set('primary_color', v)} />
            <ColorSwatch label="Secondary Color" value={form.secondary_color} onChange={v => set('secondary_color', v)} />
            <ColorSwatch label="Background" value={form.background_color} onChange={v => set('background_color', v)} />
            <ColorSwatch label="Sidebar" value={form.sidebar_color} onChange={v => set('sidebar_color', v)} />
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-2xl p-6"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Live Preview</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: form.sidebar_color }}>
              <div className="w-5 h-5 rounded-lg flex items-center justify-center"
                   style={{ background: form.primary_color, boxShadow: `0 0 10px ${form.primary_color}66` }}>
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-sm" style={{ color: form.primary_color }}>{form.company_name || 'LearnFlow'}</span>
            </div>
            <div className="p-4" style={{ background: form.background_color }}>
              <div className="flex gap-3 mb-3">
                {['Dashboard', 'Learning', 'Certs'].map((t, i) => (
                  <div key={t} className="px-3 py-1.5 rounded-lg text-xs font-medium"
                       style={i === 0
                         ? { background: `${form.primary_color}22`, color: form.primary_color, border: `1px solid ${form.primary_color}44` }
                         : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {t}
                  </div>
                ))}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full w-3/5 rounded-full"
                     style={{ background: `linear-gradient(90deg, ${form.primary_color}, ${form.secondary_color})`,
                              boxShadow: `0 0 8px ${form.primary_color}88` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            onClick={() => setForm({ company_name: 'LearnFlow', logo_url: '', primary_color: '#00D4FF', secondary_color: '#7C3AED', background_color: '#0A0E1A', sidebar_color: '#0D1117' })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <RotateCcw className="w-4 h-4" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: saved
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #00D4FF, #0EA5E9, #7C3AED)',
              color: saved ? '#fff' : '#000',
              boxShadow: saved ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 24px rgba(0,212,255,0.35)',
            }}
          >
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & Apply'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}