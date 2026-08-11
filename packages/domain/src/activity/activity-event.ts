export interface ActivityEventSummary {
  readonly actorId: string;
  readonly eventType: string;
  readonly id: number;
  readonly occurredAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly subjectId: string | null;
  readonly subjectType: string;
}
