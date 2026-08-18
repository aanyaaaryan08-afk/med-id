import { useEffect, useState } from 'react';
import type { Patient } from '@/types';
import { DEMO_MED_ID, patient as demoPatient } from '@/data';
import { Card } from '@/components/ui';
import { Watch, QrCode, Fingerprint, ShieldCheck, Siren, ArrowRight, Heart } from 'lucide-react';

export function Bracelet({ patient }: { patient?: Patient }) {
  const p = patient ?? demoPatient;
  const medId = p.medId || DEMO_MED_ID;
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      try {
        const QRCode = (await import('qrcode')).default;
        const url = await QRCode.toDataURL(medId, {
          width: 256,
          margin: 1,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) setQrDataUrl(url);
      } catch {
        // fallback: no QR
      }
    }
    generate();
    return () => { cancelled = true; };
  }, [medId]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600">
          <Watch size={18} />
        </div>
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">MED-ID Bracelet</h1>
          <p className="text-sm text-ink-500">Physical identification concept</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Bracelet visual */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm">
            {/* Wristband */}
            <div className="rounded-3xl bg-gradient-to-br from-teal-600 to-brand-700 p-1.5 shadow-card-hover">
              <div className="rounded-2xl bg-white p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="grid place-items-center h-8 w-8 rounded-lg bg-teal-600 text-white">
                      <Fingerprint size={16} />
                    </div>
                    <span className="font-display font-extrabold text-ink-900">
                      MED<span className="text-teal-600">-ID</span>
                    </span>
                  </div>
                  <Heart size={16} className="text-red-400" />
                </div>

                {/* MED-ID */}
                <div className="rounded-xl bg-ink-50 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Medical ID</p>
                  <p className="font-mono text-2xl font-extrabold text-teal-700 mt-1 tracking-wider">
                    {medId}
                  </p>
                </div>

                {/* QR code */}
                <div className="mt-4 flex flex-col items-center">
                  <div className="relative grid place-items-center h-32 w-32 rounded-xl bg-white border-2 border-ink-200 overflow-hidden">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt={`QR code for ${medId}`} className="h-full w-full object-contain" />
                    ) : (
                      <div className="grid place-items-center h-full w-full text-ink-300">
                        <QrCode size={48} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-ink-400 mt-2">Scan for Emergency Profile</p>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between text-xs">
                  <span className="text-ink-500 font-semibold">{p.name}</span>
                  <span className="text-red-600 font-bold flex items-center gap-1">
                    <Siren size={12} /> Emergency ID
                  </span>
                </div>
              </div>
            </div>
            {/* Strap accents */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-20 w-6 rounded-l-2xl bg-teal-700 hidden sm:block" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-20 w-6 rounded-r-2xl bg-brand-700 hidden sm:block" />
          </div>

          <div className="flex gap-2 mt-6">
            <span className="chip bg-teal-50 text-teal-700"><ShieldCheck size={13} /> Tamper-resistant</span>
            <span className="chip bg-blue-50 text-blue-700"><Fingerprint size={13} /> Unique per patient</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="grid place-items-center h-11 w-11 rounded-xl bg-red-50 text-red-600 shrink-0">
                <Siren size={20} />
              </div>
              <div>
                <h2 className="font-display font-bold text-ink-900 text-lg">In an emergency</h2>
                <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">
                  In an emergency, the MED-ID can help authorized healthcare professionals identify
                  the patient's medical profile quickly. Scanning the QR code or entering the
                  MED-ID instantly surfaces critical information like blood group, allergies, and
                  emergency contact.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {[
              { icon: Fingerprint, title: 'Unique identity', desc: 'Every patient receives a distinct MED-ID linked to their centralized record.' },
              { icon: QrCode, title: 'Instant access', desc: 'The QR code encodes the patient MED-ID and opens the Emergency Access screen with the ID pre-filled.' },
              { icon: ShieldCheck, title: 'Authorized only', desc: 'Full records require professional verification; emergency info is always accessible.' },
            ].map((f) => (
              <Card key={f.title} hover className="p-5 flex items-start gap-3">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-teal-50 text-teal-600 shrink-0">
                  <f.icon size={18} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-ink-800">{f.title}</h3>
                  <p className="text-sm text-ink-500 mt-0.5">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="rounded-xl bg-ink-50 border border-ink-200 p-4 flex items-start gap-2">
            <ArrowRight size={16} className="text-ink-400 mt-0.5 shrink-0" />
            <p className="text-sm text-ink-500">
              The bracelet could be a wristband, a card in a wallet, or a tag on a keychain — the
              MED-ID is what matters, not the form factor.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-ink-400 mt-6">
        Fictional concept for science-exhibition demonstration. The QR code encodes the patient MED-ID.
      </p>
    </div>
  );
}
