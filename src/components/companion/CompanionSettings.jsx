'use client';

import { useEffect, useState } from 'react';
import {
  COMPANION_SETTINGS_CHANGED,
  announceToCompanion,
  companionService,
} from '../../services/companionService';

export default function CompanionSettings() {
  const [settings, setSettings] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    companionService.getSettings().then(setSettings).catch(() => setFailed(true));
  }, []);

  const update = (changes) => {
    setFailed(false);
    companionService
      .updateSettings(changes)
      .then((updated) => {
        setSettings(updated);
        announceToCompanion(COMPANION_SETTINGS_CHANGED);
      })
      .catch(() => setFailed(true));
  };

  if (failed) {
    return <p className="text-sm text-slate-500">Kalki settings are unavailable right now.</p>;
  }
  if (!settings) return null;

  const sleeping = settings.sleepingUntil && new Date(settings.sleepingUntil) > new Date();

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!settings.hidden}
          onChange={(event) => update({ hidden: !event.target.checked })}
        />
        Show Kalki
      </label>
      {sleeping && (
        <button
          type="button"
          onClick={() => update({ sleepMinutes: 0 })}
          className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium dark:border-slate-700"
        >
          Wake Kalki
        </button>
      )}
    </div>
  );
}
