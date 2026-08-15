import { SettingsPreview } from '@/components/settings-preview';

export default function InstallationsSettingsPage() {
  return (
    <SettingsPreview
      availability='deferred'
      description='Observed GitHub installation-management information architecture only. App Principal, Installation, credentials, Repository binding, and connector execution remain deferred.'
      title='Installed Apps'
    />
  );
}
