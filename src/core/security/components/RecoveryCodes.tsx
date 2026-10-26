import { Button } from '@ui/shad-cn/components/button.tsx';
import { Copy, Download } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/** One-time recovery codes: grid + copy + download as text file. */
export const RecoveryCodes: React.FC<{ codes: string[] }> = ({ codes }) => {
  const { t } = useTranslation('security');
  const text = codes.join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('errors.unknown'));
    }
  };

  const download = () => {
    const blob = new Blob([`${t('totp.recoveryFileTitle')}\n\n${text}\n`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recovery-codes.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 p-4 font-mono text-[17px] tracking-wider">
        {codes.map(code => (
          <li key={code} className="text-center select-all">
            {code}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" pill className="h-11 font-bold" onClick={copy}>
          <Copy />
          {t('common.copy')}
        </Button>
        <Button variant="outline" pill className="h-11 font-bold" onClick={download}>
          <Download />
          {t('common.download')}
        </Button>
      </div>
    </div>
  );
};
