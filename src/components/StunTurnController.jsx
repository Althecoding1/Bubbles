import React, { Component } from 'react';
import { render } from 'react-dom';

class webRTCconnection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pc1: '',
      pc2: '',
      offerOptions: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      },
      localVideo: document.getElementById('localVideo'),
      remoteVideo: document.getElementById('remoteVideo'),
      localStream: null
    }
    this.getName = this.getName.bind(this);
    this.getOtherPc = this.getOtherPc.bind(this);
    this.gotStream = this.gotStream.bind(this);
    this.createConnection = this.createConnection.bind(this);
    this.gotRemoteStream = this.gotRemoteStream.bind(this);
    this.onCreateSessionDescriptionError = this.onCreateSessionDescriptionError.bind(this);
    this.onCreateOfferSuccess = this.onCreateOfferSuccess.bind(this);
    this.onSetLocalSuccess = this.onSetLocalSuccess.bind(this);
    this.onSetRemoteSuccess = this.onSetRemoteSuccess.bind(this);
    this.onSetSessionDescriptionError = this.onSetSessionDescriptionError.bind(this);
    this.onCreateAnswerSuccess = this.onCreateAnswerSuccess.bind(this);
    this.onIceCandidate = this.onIceCandidate.bind(this);
    this.onAddIceCandidateSuccess = this.onAddIceCandidateSuccess.bind(this);
    this.onAddIceCandidateError = this.onAddIceCandidateError.bind(this);
    this.onIceStateChange = this.onIceStateChange.bind(this);
    this.nextUser = this.nextUser.bind(this);
  }

  componentDidMount() {
    this.createConnection();
  }

  componentWillReceiveProps(nextProps, nextState) {
    if(nextProps.end && !nextProps.start) {
      this.nextUser();
    }
  }

  getName(pc) {
    return (pc === this.state.pc1) ? 'pc1' : 'pc2';
  }
  getOtherPc(pc) {
    return (pc === this.state.pc1) ? this.state.pc2 : this.state.pc1;
  }

  gotStream(stream) {
    this.state.localVideo.srcObject = stream;
    let localStream = stream;
    this.setState({localStream});
  }

  createConnection(callback) {
    console.log('starting connection');

    navigator.mediaDevices.getUserMedia({
      audio: true, video: true
    }).then(this.gotStream)
    .then( () => {
      var videoTracks = this.state.localStream.getVideoTracks();
      var audioTracks = this.state.localStream.getAudioTracks();
      if (videoTracks.length > 0) {
        console.log('Using video device: ' + videoTracks[0].label);
      }
      if (audioTracks.length > 0) {
        console.log('Using audio device: ' + audioTracks[0].label);
      }
      let servers = {"iceServers": [{"urls": "stun:stun.l.google.com:19302"}]};
      this.state.pc1 = new RTCPeerConnection(servers);
      this.state.pc1.onicecandidate = e => this.onIceCandidate(this.state.pc1, e);
      this.state.pc2 = new RTCPeerConnection(servers);
      this.state.pc2.onicecandidate = e => this.onIceCandidate(this.state.pc2, e);
      this.state.pc1.oniceconnectionstatechange = e => this.onIceStateChange(this.state.pc1, e);
      this.state.pc2.oniceconnectionstatechange = e => this.onIceStateChange(this.state.pc2, e);
      this.state.pc2.ontrack = this.gotRemoteStream;
      this.state.localStream.getTracks().forEach( track => this.state.pc1.addTrack(track, this.state.localStream));
      this.state.pc1.createOffer(this.state.offerOptions).then(this.onCreateOfferSuccess, this.onCreateSessionDescriptionError);
    });
  }

  gotRemoteStream(e) {
    if(this.state.remoteVideo.srcObject !== e.streams[0]) {
      this.state.remoteVideo.srcObject = e.streams[0];
    }
      console.log('pc2 received remote stream');
  }

  onCreateSessionDescriptionError(error) {
    console.log('Failed to create session description: ' + error);
  }

  onCreateOfferSuccess(desc) {
    console.log('Offer from pc1\n' + desc.sdp);
    console.log('pc1 setLocalDescription start');
    this.state.pc1.setLocalDescription(desc).then( () => this.onSetLocalSuccess(this.state.pc1),
    this.onSetSessionDescriptionError);
    console.log('pc2 setRemoteDescription start');
    this.state.pc2.setRemoteDescription(desc).then( () => this.onSetRemoteSuccess(this.state.pc2), this.onSetSessionDescriptionError);
    console.log('pc2 createAnswer start');
    this.state.pc2.createAnswer().then(this.onCreateAnswerSuccess, this.onCreateSessionDescriptionError);
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
    this.state.pc2.setLocalDescription(desc).then( () => this.onSetLocalSuccess(this.state.pc2),
      this.onSetSessionDescriptionError);
    console.log('pc1 setRemoteDescription start');
    this.state.pc1.setRemoteDescription(desc).then( () => this.onSetRemoteSuccess(this.state.pc1),
      this.onSetSessionDescriptionError);
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
    let pc1 = this.state.pc1, pc2 = this.state.pc2,
    localVideo = this.state.localVideo, remoteVideo = this.state.remoteVideo;
    pc1.close();
    pc2.close();
    pc1 = '';
    pc2 = '';
    localVido.srcObject = '';
    remoteVideo.srcObject = '';
    this.setState({pc1, pc2, localVideo, remoteVideo});
  }

  render() {
    return(
      <div></div>
    );
  }
};


export default webRTCconnection;
