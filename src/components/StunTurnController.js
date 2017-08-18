export class webRTCconnection {
  constructor(props) {
    this.pc1 = '',
    this.pc2 = '',
    this.offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    },
    this.localStream = '',
    this.remoteStream = ''
  }

  getName(pc) {
    return (pc === this.pc1) ? 'pc1' : 'pc2';
  }
  getOtherPc(pc) {
    return (pc === this.pc1) ? this.pc2 : this.pc1;
  }

  gotStream(stream) {
  console.log('Received local stream');
  this.localStream = stream;
  }

  createConnection() {
    console.log('starting connection');
    navigator.mediaDevices.getUserMedia({
      audio: true, video: true
    }).then(this.gotStream.bind(this))
    .then( () => {
      var videoTracks = this.localStream.getVideoTracks();
      var audioTracks = this.localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        console.log('Using video device: ' + videoTracks[0].label);
      }
      if (audioTracks.length > 0) {
        console.log('Using audio device: ' + audioTracks[0].label);
      }
      let servers = null;
      this.pc1 = new RTCPeerConnection(servers);
      this.pc1.onicecandidate = e => this.onIceCandidate(this.pc1, e);
      this.pc2 = new RTCPeerConnection(servers);
      this.pc2.onicecandidate = e => this.onIceCandidate(this.pc2, e);
      this.pc1.oniceconnectionstatechange = e => this.onIceStateChange(this.pc1, e);
      this.pc2.oniceconnectionstatechange = e => this.onIceStateChange(this.pc2, e);
      this.pc2.ontrack = this.gotRemoteStream.bind(this);
      this.localStream.getTracks().forEach( track => pc1.addTrack(track, this.localStream));
      this.pc1.createOffer(this.offerOptions)
      .then(this.onCreateOfferSuccess.bind(this), this.onCreateSessionDescriptionError.bind(this));
    });
  }

  gotRemoteStream(e) {
    console.log('REMOTE STREAM ON CONTROLLER!');
    if (this.remoteVideo.srcObject !== e.streams[0]) {
      this.remoteVideo.srcObject = e.streams[0];
      console.log('pc2 received remote stream');
    }
  }

  onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error);
  }

  onCreateOfferSuccess(desc) {
    console.log('Offer from pc1\n' + desc.sdp);
    console.log('pc1 setLocalDescription start');
    this.pc1.setLocalDescription(desc).then( () => this.onSetLocalSuccess(this.pc1),
    this.onSetSessionDescriptionError.bind(this));
    console.log('pc2 setRemoteDescription start');
    this.pc2.setRemoteDescription(desc).then( () => this.onSetRemoteSuccess(this.pc2), this.onSetSessionDescriptionError.bind(this));
    console.log('pc2 createAnswer start');
    this.pc2.createAnswer().then(this.onCreateAnswerSuccess.bind(this), this.onCreateSessionDescriptionError.bind(this));
  }

  onSetLocalSuccess(pc) {
    console.log(this.getName(pc) + ' setLocalDescription complete');
  }
  onSetRemoteSuccess(pc) {
    console.log(this.getName(pc) + ' setRemoteDescription complete');
  }
  onSetSessionDescriptionError(error) {
    console.log('Failed to set session description: ' + error);
  }

  onCreateAnswerSuccess(desc) {
    console.log('Answer from pc2:\n' + desc.sdp);
    console.log('pc2 setLocalDescription start');
    this.pc2.setLocalDescription(desc).then( () => this.onSetLocalSuccess(this.pc2),
      this.onSetSessionDescriptionError.bind(this));
    console.log('pc1 setRemoteDescription start');
    this.pc1.setRemoteDescription(desc).then( () => this.onSetRemoteSuccess(this.pc1),
      this.onSetSessionDescriptionError.bind(this));
  }

  onIceCandidate(pc, event) {
    this.getOtherPc(pc).addIceCandidate(event.candidate)
    .then( () => this.onAddIceCandidateSuccess(pc), (err) => this.onAddIceCandidateError(pc, err));
    console.log(this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
        event.candidate.candidate : '(null)'));
  }

  onAddIceCandidateSuccess(pc) {
    console.log(this.getName(pc) + ' addIceCandidate success');
  }
  onAddIceCandidateError(pc, error) {
    console.log(this.getName(pc) + ' failed to add ICE Candidate: ' + error);
  }
  onIceStateChange(pc, event) {
    if (pc) {
      console.log(this.getName(pc) + ' ICE state: ' + pc.iceConnectionState);
      console.log('ICE state change event: ', event);
    }
  }

  nextUser() {
    console.log('Ending call');
    this.pc1.close();
    this.pc2.close();
    this.pc1 = null;
    this.pc2 = null;
  }
};
