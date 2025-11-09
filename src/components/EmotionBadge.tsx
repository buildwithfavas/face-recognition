import { Badge } from 'react-bootstrap';

export type EmotionKey =
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'disgusted'
  | 'surprised';

const EMOJI: Record<EmotionKey, string> = {
  neutral: '😐',
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
};

export type EmotionBadgeProps = {
  emotion: EmotionKey;
  probability: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
};

function formatPct(p: number): string {
  const v = Math.max(0, Math.min(1, p));
  if (v >= 0.995) return '100%';
  if (v >= 0.1) return `${(v * 100).toFixed(0)}%`;
  return `${(v * 100).toFixed(1)}%`;
}

export default function EmotionBadge({ emotion, probability, size = 'sm', variant }: EmotionBadgeProps) {
  const pct = formatPct(probability);
  const icon = EMOJI[emotion] ?? '🙂';
  const bs = variant ?? (probability >= 0.6 ? 'success' : probability >= 0.3 ? 'warning' : 'secondary');
  const className = size === 'lg' ? 'fs-6' : size === 'md' ? 'fs-7' : 'small';
  return (
    <Badge bg={bs} className={`d-inline-flex align-items-center gap-1 ${className}`} title={`${emotion} ${pct}`}>
      <span aria-hidden>{icon}</span>
      <span className="text-uppercase">{emotion}</span>
      <span>{pct}</span>
    </Badge>
  );
}
