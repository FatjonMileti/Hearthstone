import { IRoom } from '../messages.interface';
import { useProfileStore } from '../../../globalState/profile';
import { Role } from '../../../enums';
import { MatchDetailsProperty } from './MatchDetailsProperty/MatchDetailsProperty';
import { MatchDetailsTenant } from './MatchDetailsTenant/MatchDetailsTenant';

interface MatchDetailsProps {
  room: IRoom;
  fetchChatRooms: () => any;
}

export const MatchDetails = ({ room, fetchChatRooms }: MatchDetailsProps) => {
  const profileStore = useProfileStore();
  return (
    <>
      {profileStore.role === Role.Tenant && (
        <MatchDetailsProperty room={room} fetchChatRooms={fetchChatRooms} />
      )}
      {profileStore.role === Role.Landlord && (
        <MatchDetailsTenant room={room} fetchChatRooms={fetchChatRooms} />
      )}
    </>
  );
};
