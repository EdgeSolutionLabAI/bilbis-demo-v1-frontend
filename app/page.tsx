import BaconImage from './components/BaconImage';
import RandomGift from './components/RandomGift';
import { PresenceBadge } from '../features/presence/components/presence-badge';

export default function Home() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="absolute top-4 right-4">
        <PresenceBadge />
      </div>
      <div className="absolute top-4 left-4">
        <RandomGift />
      </div>
      <BaconImage />
    </div>
  );
}
