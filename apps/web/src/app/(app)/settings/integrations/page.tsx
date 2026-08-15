import { SettingsPreview } from '@/components/settings-preview';
export default function IntegrationSettingsPage() {
  return (
    <SettingsPreview
      availability='deferred'
      description='Shows the reviewed catalog contract and explicitly deferred connection state. There is no Install, Connect, OAuth, credential, App Principal, or Repository binding.'
      title='Integration connections'
    />
  );
}
