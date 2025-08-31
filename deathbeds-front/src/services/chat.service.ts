import http from '../utils/sso.api'

export const chatServices = {
  async listaChatPadrao (id: number, quantidade: number) {
    const data = await http.get(`/chats-padrao?usuario_id=${id}&quantidade=${quantidade}`)
    return data;
  },
  async listaChatAtendimento (id: number, quantidade: number) {
    const data = await http.get(`/chats-atendimento?usuario_id=${id}&quantidade=${quantidade}`)
    return data;
  },
  async criaChat (payload: object) {
    const data = await http.post(`/chat`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return data;
  },
  async retornaChatPadrao (id: number, id_chat: number, quantidade: number) {
    const data = await http.get(`/chat-padrao?usuario_id=${id}&chat_id=${id_chat}&quantidade=${quantidade}`);
    return data;
  },

  async retornaChatAtendimento (id: number, id_chat: number, quantidade: number) {
    const data = await http.get(`/chat-atendimento?usuario_id=${id}&chat_id=${id_chat}&quantidade=${quantidade}`);
    return data;
  },
}
