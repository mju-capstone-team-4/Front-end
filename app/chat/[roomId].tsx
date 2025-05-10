import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import UserChat from './userChat';

export default function RoomScreen() {
  const { roomId, partnerName, partnerImage } = useLocalSearchParams();

  if (!roomId || !partnerName || !partnerImage) {
    return <Text>잘못된 접근입니다</Text>;
  }

  return (
    <UserChat
      roomId={roomId as string}
      partnerName={partnerName as string}
      partnerImage={partnerImage as string}
    />
  );
}