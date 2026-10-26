import { cn } from '@ui/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { type LucideIcon, Mic, Video, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { selectDevice } from '../call.engine';
import { useCallStore } from '../store';
import type { CallDeviceKind } from '../types';
import { type ICallDevice, useAudioLevel, useMediaDevices } from './use.media.devices';

interface ICallDeviceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  localStream: MediaStream | null;
}

/** Above the call overlay (`z-[200]`). */
const CALL_DRAWER_LAYER = 'z-[210]';

/** Mic / camera picker – drawer from the right (swipe right / back / backdrop closes it). */
export const CallDeviceDrawer: React.FC<ICallDeviceDrawerProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('call', { useSuspense: false });
  // Select popups render inside the drawer → its focus trap keeps working.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <Drawer open={open} onOpenChange={next => onOpenChange(next)} swipeDirection="down">
        <DrawerContent layerClassName={CALL_DRAWER_LAYER} className="w-96 max-w-full mx-auto">
          <div
            ref={setContainer}
            className="flex h-full min-h-0 flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex items-center justify-between gap-2 py-3 pr-3 pl-6">
              <div className="min-w-0 flex-1">
                <DrawerTitle className="truncate text-title font-bold tracking-tight">
                  {t('devices.title')}
                </DrawerTitle>
                <DrawerDescription className="truncate text-caption text-muted-foreground">
                  {t('devices.description')}
                </DrawerDescription>
              </div>
              <button
                type="button"
                aria-label={t('actions.close')}
                onClick={() => onOpenChange(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain border-t border-border/50 px-6 py-5">
              {open && <DeviceFields container={container} />}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const DeviceFields: React.FC<{ container: HTMLElement | null }> = ({ container }) => {
  const { t } = useTranslation('call', { useSuspense: false });
  const devices = useMediaDevices(true);
  const hasCamera = useCallStore(state => state.hasCamera);
  const audioDeviceId = useCallStore(state => state.audioDeviceId);
  const videoDeviceId = useCallStore(state => state.videoDeviceId);
  const localStream = useCallStore(state => state.localStream);
  const micOn = useCallStore(state => state.micOn);
  const level = useAudioLevel(localStream, micOn);
  const percent = Math.round(level * 100);

  return (
    <>
      {hasCamera && (
        <DeviceSelect
          kind="videoinput"
          icon={Video}
          label={t('devices.camera')}
          devices={devices.videoinput}
          selected={videoDeviceId}
          container={container}
        />
      )}
      <DeviceSelect
        kind="audioinput"
        icon={Mic}
        label={t('devices.microphone')}
        devices={devices.audioinput}
        selected={audioDeviceId}
        container={container}
      >
        <div className="flex items-center gap-3 pt-1">
          <span className="w-12 shrink-0 text-caption text-muted-foreground">
            {micOn ? t('devices.level') : t('devices.muted')}
          </span>
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            role="meter"
            aria-label={t('devices.level')}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-[width] duration-75"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </DeviceSelect>
    </>
  );
};

interface IDeviceSelectProps {
  kind: CallDeviceKind;
  icon: LucideIcon;
  label: string;
  devices: ICallDevice[];
  selected: string | null;
  container: HTMLElement | null;
  children?: React.ReactNode;
}

const DeviceSelect: React.FC<IDeviceSelectProps> = ({
  kind,
  icon: Icon,
  label,
  devices,
  selected,
  container,
  children,
}) => {
  const { t } = useTranslation('call', { useSuspense: false });
  const id = `call-device-${kind}`;
  // The track may report the real id while the list only has "default" → show the first entry.
  const value = devices.some(device => device.deviceId === selected)
    ? (selected ?? undefined)
    : selected
      ? devices[0]?.deviceId
      : undefined;
  const name = (device: ICallDevice) =>
    device.label.startsWith('#') ? `${label} ${device.label.slice(1)}` : device.label;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-body font-bold text-foreground">
        <Icon className="size-4 text-muted-foreground" /> {label}
      </label>
      <Select
        value={value}
        onValueChange={deviceId => void selectDevice(kind, deviceId)}
        disabled={devices.length === 0}
      >
        <SelectTrigger
          id={id}
          className={cn('h-12 rounded-xl px-4 text-body', devices.length === 0 && 'opacity-60')}
        >
          <SelectValue placeholder={t('devices.none')} />
        </SelectTrigger>
        <SelectContent container={container} className="rounded-xl">
          {devices.map(device => (
            <SelectItem
              key={device.deviceId}
              value={device.deviceId}
              className="min-h-11 rounded-lg py-2.5 pl-3 text-body"
            >
              {name(device)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {children}
    </div>
  );
};
