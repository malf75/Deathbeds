import http from '../utils/sso.api'

export const chatServices = {
  async listaChat (id: number, quantidade: number) {
    const data = await http.get(`/chats?usuario_id=${id}&quantidade=${quantidade}`)
    return data;
  },
  async criaChat (payload: object) {
    const data = await http.post(`/chats`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },
  async retornaChat (id: number, id_chat: number, quantidade: number) {
    const data = await http.get(`/chat?usuario_id=${id}&chat_id=${id_chat}&quantidade=${quantidade}`);
    return data;
  },
}
