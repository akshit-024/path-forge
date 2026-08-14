import { useEffect, useState } from 'react';
import { loadProfile, saveProfile, type StoredProfile } from '../utils/storage';

export function usePersistentProfile() {
  const [profile, setProfile] = useState<StoredProfile>(loadProfile);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  return [profile, setProfile] as const;
}
