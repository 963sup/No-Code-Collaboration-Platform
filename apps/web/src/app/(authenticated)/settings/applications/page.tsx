import { SettingsPreview } from '@/components/settings-preview';

export default function ApplicationsSettingsPage() {
  return (
    <SettingsPreview
      availability='deferred'
      description='Observed GitHub authorized-application information architecture only. OAuth application authority and connection lifecycle are not established.'
      title='Applications'
    />
  );
}
