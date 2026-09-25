import { useState } from 'react';
import { PlayerList } from './PlayerList';
import { PlayerProfileDialog } from './PlayerProfileDialog';

interface PlayersTabProps {
  serverId: string;
  onViewModeration?: (uuid: string) => void;
}

export function PlayersTab({ serverId, onViewModeration }: PlayersTabProps) {
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSelectPlayer = (uuid: string) => {
    setSelectedUuid(uuid);
    setProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileOpen(false);
    setSelectedUuid(null);
  };

  const handleViewModeration = (uuid: string) => {
    handleCloseProfile();
    if (onViewModeration) {
      onViewModeration(uuid);
    }
  };

  return (
    <div className="space-y-6">
      <PlayerList serverId={serverId} onSelectPlayer={handleSelectPlayer} />

      <PlayerProfileDialog
        serverId={serverId}
        playerUuid={selectedUuid}
        open={profileOpen}
        onClose={handleCloseProfile}
        onViewModeration={handleViewModeration}
      />
    </div>
  );
}
