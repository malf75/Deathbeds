export const chamadaService = {
  async conectaWebsocket (id: number) {
    return new WebSocket(`ws://192.168.1.237:8000/ws/${id}`);
  },
}
