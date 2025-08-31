<script setup lang="ts">
  let localStream: MediaStream;
  let remoteStream: MediaStream;
  let peerConnection: RTCPeerConnection;

  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.1.google.com:19302',
          'stun:stun2.1.google.com:19302',
        ],
      },
    ],
  };

  async function inicia () {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    (document.getElementById('user-1') as HTMLVideoElement).srcObject = localStream;
  }

  const props = defineProps<{
    usuario: object;
    websocket: object;
  }>();
  const destinatarioId = ref(0);

  async function criaOferta (id) {
    criaPeerConnection();

    const oferta = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(oferta);
    destinatarioId.value = id;

    props.websocket.socket.send(
      JSON.stringify({
        type: 'offer',
        offer: oferta,
        to: id,
        from: props.usuario.id,
      })
    );
  }

  async function recebeOferta (oferta: RTCSessionDescriptionInit, from: number) {
    criaPeerConnection();

    await peerConnection.setRemoteDescription(new RTCSessionDescription(oferta));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    destinatarioId.value = from;

    props.websocket.socket.send(
      JSON.stringify({
        type: 'answer',
        answer: answer,
        from: props.usuario.id,
        to: from,
      })
    );
  }

  async function recebeAnswer (answer: RTCSessionDescriptionInit) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async function recebeCandidate (candidate: RTCIceCandidateInit) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Erro ao adicionar candidato ICE:', err);
    }
  }

  function criaPeerConnection () {
    if (peerConnection) return;

    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    (document.getElementById('user-2') as HTMLVideoElement).srcObject =
      remoteStream;

    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
    };

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        props.websocket.socket.send(
          JSON.stringify({
            type: 'candidate',
            candidate: event.candidate,
            to: destinatarioId.value,
            from: props.usuario.id,
          })
        );
      }
    };
  }

  onMounted(async () => {
    await inicia();

    const state = history.state as any;
    if (state?.acceptedCall) {
      const { destino_id, destinatario_id } = state.acceptedCall;
      if (destinatario_id === props.usuario.id) {
        await criaOferta(destino_id);
      }
    }

    props.websocket.socket.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "offer":
          await recebeOferta(data.offer, data.from);
          break;

        case "answer":
          await recebeAnswer(data.answer);
          break;

        case "candidate":
          await recebeCandidate(data.candidate);
          break;
      }
    };
  });

  onUnmounted(() => {
    peerConnection.close();
  });
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <v-img aspect-ratio="4/3" cover src="/aaaaa.png" :width="100" />

    <div
      style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2em;
      "
    >
      <video
        style="
          background-color: black;
          width: 100%;
          height: 420px;
          border: 2px solid rgb(76, 175, 80);
          border-radius: 20px;
        "
        id="user-1"
        autoplay
        playsinline
        muted
      ></video>

      <video
        style="
          background-color: black;
          width: 100%;
          height: 420px;
          border: 2px solid rgb(76, 175, 80);
          border-radius: 20px;
        "
        id="user-2"
        autoplay
        playsinline
      ></video>
    </div>
  </div>
</template>
