import http from '../utils/sso.api'

export const seguidoresServices = {
  async listaSeguindo (id: number, quantidade: number) {
    const data = await http.get(`/seguindo?usuario_id=${id}&quantidade=${quantidade}`)
    return data;
  },
}
