<script setup lang="ts">
  import { chamadaService } from '@/services/chamada.service';

  let localStream;
  let remoteStream;
  let peerConnection;

  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302'],
      },
    ],
  }

  async function inicia () {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById("user-1").srcObject = localStream;
  }

  const props = defineProps<{
    usuario: {
      id: number,
      nome: string
    },
  }>();

  const data = reactive({
    socket: null,
    userId: null,
    targetUserId: 2,
  });

  async function criaOferta () {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      })
    }

    peerConnection.onicecandidate = async (event) => {
      if(event.candidate) {
        console.log('new ICE candidate:', event.candidate);
      }
    }

    const oferta = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(oferta);

    console.log('Oferta:', oferta)
  }

  async function iniciaWebSocket () {
    data.socket = await chamadaService.conectaWebsocket(data.userId);
    data.socket.onopen = () => {
      console.log("WebSocket conectado");
    };

    data.socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log("Recebido do servidor:", response);
      trataSinal(response);
    }

    data.socket.onclose = () => {
      console.log("WebSocket desconectado");
    }
  }

  watch(() => props.usuario.id, async (id) => {
    if (id && !data.socket) {
      data.userId = await props.usuario.id;
      await iniciaWebSocket();
    }
  })

  onMounted(async () => {
    await inicia();
    await criaOferta();
  })

</script>
<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <v-img
      aspect-ratio="4/3"
      cover
      src="/aaaaa.png"
      :width="100"
    />
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2em;">
      <video style="background-color: black; width: 100%; height: 420px;" id="user-1" autoplay playsinline muted></video>
      <video style="background-color: black; width: 100%; height: 420px;" id="user-2" autoplay playsinline></video>
    </div>
  </div>
</template>
