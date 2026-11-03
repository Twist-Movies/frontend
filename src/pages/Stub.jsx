import { Badge, Card, SectionTitle } from '../components/ui';

export function Stub({ title, sprint, planned }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-3">
          <Badge>{sprint}</Badge>
        </div>
        <h1 className="text-3xl font-black">{title}</h1>
      </div>
      <Card>
        <SectionTitle>O que esta tela vai ter</SectionTitle>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted">
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
