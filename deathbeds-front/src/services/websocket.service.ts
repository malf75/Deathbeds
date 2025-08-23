export const websocketService = {
  async conectaWebsocket (token: string) {
    return new WebSocket(`ws://${import.meta.env.VITE_API_IP}:8000/ws/${token}`);
  },
}
