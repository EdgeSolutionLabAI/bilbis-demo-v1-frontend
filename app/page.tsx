import BaconImage from './components/BaconImage';
import { PresenceBadge } from '../features/presence/components/presence-badge';

export default function Home() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="absolute top-4 right-4">
        <PresenceBadge />
      </div>
      <BaconImage />
    </div>
  );
}
