import { SettingsPreview } from '@/components/settings-preview';
export default function EnterpriseSettingsPage() {
  return (
    <SettingsPreview
      availability='deferred'
      description='Enterprise is not an identity, owner, Principal, policy engine, or table in this milestone. This projection states the future admission test only.'
      title='Enterprises'
    />
  );
}
