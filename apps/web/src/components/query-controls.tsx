import { Button, Input, Label } from '@no-code-collaboration-platform/ui';

interface QueryOption {
  readonly label: string;
  readonly value: string;
}

type QueryControl =
  | {
      readonly kind: 'text';
      readonly name: string;
      readonly label: string;
      readonly value?: string;
      readonly placeholder?: string;
    }
  | {
      readonly kind: 'select';
      readonly name: string;
      readonly label: string;
      readonly value?: string;
      readonly options: readonly QueryOption[];
    };

export function QueryControls({
  action,
  controls
}: {
  readonly action: string;
  readonly controls: readonly QueryControl[];
}) {
  return (
    <form action={action} className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4' method='get'>
      {controls.map((control) => (
        <div className='space-y-2' key={control.name}>
          <Label htmlFor={`${action}-${control.name}`}>{control.label}</Label>
          {control.kind === 'text' ? (
            <Input
              defaultValue={control.value}
              id={`${action}-${control.name}`}
              name={control.name}
              placeholder={control.placeholder}
            />
          ) : (
            <select
              className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring'
              defaultValue={control.value}
              id={`${action}-${control.name}`}
              name={control.name}
            >
              {control.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      <div className='flex items-end gap-2'>
        <Button type='submit'>Apply</Button>
        <a
          className='inline-flex h-9 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground'
          href={action}
        >
          Clear
        </a>
      </div>
    </form>
  );
}
