import React, { useState, useEffect } from 'react';
import { useData } from '@/components/providers/DataProvider';
import { useBrand } from '@/components/providers/BrandProvider';
import { base44 } from '@/api/base44Client';
import { Palette, Upload, Save, RotateCcw, CheckCircle2, Building2, GraduationCap } from 'lucide-react';

const PRESETS = [
  { name: 'Indigo (Default)', primary: '#4F46E5', secondary: '#6366F1' },
  { name: 'Violet',           primary: '#7C3AED', secondary: '#8B5CF6' },
  { name: 'Sky Blue',         primary: '#0284C7', secondary: '#0EA5E9' },
  { name: 'Emerald',          primary: '#059669', secondary: '#10B981' },
  { name: 'Rose',             primary: '#E11D48', secondary: '#F43F5E' },
  { name: 'Amber',            primary: '#D97706', secondary: '#F59E0B' },
];

function Label({ children }) {
  return <div className="label-xs mb-2">{children}</div>;
}

function ColorSwatch({ label, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200"
             style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="absolute inset-0" style={{ background: value }} />
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
               className="form-input flex-1 font-mono text-sm" style={{ color: 'var(--text-primary)' }} />
      </div>
    </div>
  );
}

export default function BrandSettings() {
  const { currentUser } = useData();
  const { brand, refetch } = useBrand();
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    company_name:    'LearnFlow',
    logo_url:        '',
    primary_color:   '#4F46E5',
    secondary_color: '#6366F1',
  });

  useEffect(() => {
    if (brand) setForm(f => ({ ...f, ...brand }));
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

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--canvas)' }}>
        <div className="bg-white rounded-2xl p-10 text-center border border-red-100"
             style={{ boxShadow: '0 4px 24px rgba(239,68,68,0.1)' }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#FEE2E2' }}>
            <Palette className="w-6 h-6" style={{ color: '#EF4444' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Only</h3>
          <p style={{ color: 'var(--text-muted)' }}>This area requires administrator privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--canvas)' }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <p className="label-xs mb-1">Admin · Settings</p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Branding & Theme</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Customize your platform's visual identity
          </p>
        </div>

        {/* Company Identity */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06]"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
              <Building2 className="w-3.5 h-3.5" style={{ color: '#4F46E5' }} />
            </div>
            <h2 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Company Identity</h2>
          </div>

          {/* Logo upload */}
          <div className="mb-5">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200"
                   style={{ background: '#F8FAFC' }}>
                {form.logo_url
                  ? <img src={form.logo_url} alt="logo" className="w-full h-full object-contain p-1" />
                  : <GraduationCap className="w-8 h-8" style={{ color: 'var(--brand-primary)' }} />}
              </div>
              <div>
                <label className="cursor-pointer">
                  <div className="btn-secondary inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading…' : 'Upload Logo'}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>PNG, SVG or WebP · 256×256 recommended</p>
              </div>
            </div>
          </div>

          {/* Company name */}
          <div>
            <Label>Company Name</Label>
            <input value={form.company_name} onChange={e => set('company_name', e.target.value)}
                   placeholder="e.g. Acme Corp" className="form-input" />
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06]"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Palette className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />
            </div>
            <h2 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Brand Colors</h2>
          </div>

          {/* Presets */}
          <div className="mb-5">
            <Label>Color Presets</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => { set('primary_color', p.primary); set('secondary_color', p.secondary); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:-translate-y-0.5"
                  style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', color: '#475569' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = p.primary; e.currentTarget.style.color = p.primary; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: p.primary }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ColorSwatch label="Primary Accent" value={form.primary_color} onChange={v => set('primary_color', v)} />
            <ColorSwatch label="Secondary Color" value={form.secondary_color} onChange={v => set('secondary_color', v)} />
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-2xl p-6 border border-black/[0.06]"
             style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
          <Label>Live Preview</Label>
          <div className="rounded-xl overflow-hidden border border-slate-200 mt-2">
            {/* Sidebar preview */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#1C1C28' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                   style={{ background: form.primary_color }}>
                <GraduationCap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-white">{form.company_name || 'LearnFlow'}</span>
              <div className="ml-auto flex items-center gap-1">
                {['Dashboard', 'Paths', 'Certs'].map((t, i) => (
                  <div key={t} className="px-2 py-1 rounded-lg text-xs"
                       style={i === 0
                         ? { background: form.primary_color, color: '#fff' }
                         : { background: '#2A2A3A', color: 'rgba(255,255,255,0.4)' }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
            {/* Content preview */}
            <div className="p-4" style={{ background: '#FAFAFA' }}>
              <div className="flex gap-3">
                {[{ v: 12, l: 'Completed' }, { v: 3, l: 'In Progress' }, { v: 2, l: 'Certs' }].map(s => (
                  <div key={s.l} className="flex-1 bg-white rounded-xl p-3 border border-slate-100"
                       style={{ borderLeft: `3px solid ${form.primary_color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="text-xl font-bold" style={{ color: '#0F172A' }}>{s.v}</div>
                    <div className="text-xs" style={{ color: '#94A3B8' }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
                <div className="h-full w-2/3 rounded-full"
                     style={{ background: `linear-gradient(90deg, ${form.primary_color}, ${form.secondary_color})` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            onClick={() => setForm({ company_name: 'LearnFlow', logo_url: '', primary_color: '#4F46E5', secondary_color: '#6366F1' })}
            className="btn-secondary flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5 rounded-xl"
            style={saved ? { background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' } : {}}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & Apply'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}