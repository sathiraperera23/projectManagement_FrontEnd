import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '@/store/authStore';

let connection: signalR.HubConnection | null = null;

export const getSignalRConnection = () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_SIGNALR_HUB_URL!, {
        accessTokenFactory: () =>
          useAuthStore.getState().accessToken ?? '',
      })
      .withAutomaticReconnect()
      .build();
  }
  return connection;
};
