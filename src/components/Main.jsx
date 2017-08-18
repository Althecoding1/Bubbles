import React, { Component } from 'react';
import { render } from 'react-dom';
import { newBubbleName } from '../../bubbleConnGen.js';

import MainScene from './MainScene.jsx';
import { webRTCconnection } from './StunTurnController.js';
import '../../public/Styles/main.scss';


const io = require('socket.io-client');
const socket = io();

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      messages: [],
      localUser: '',
      remoteUser: 'No One!',
      pc1: '',
      pc2: '',
      localVideo: null,
      remoteVideo: null,
      room: '',
      connected: false,
      peerToPeer: new webRTCconnection(),
      checked: true,
    };

    this.handleChange = this.handleChange.bind(this);
    this.messageSubmit = this.messageSubmit.bind(this);
    this.handleVideo = this.handleVideo.bind(this);
    this.newConnection = this.newConnection.bind(this);

    socket.on('connect', (data) => {
      var name = newBubbleName();
      socket.emit('newUser', {'name': name});
      var localUser = name;
      var connected = true;
      this.setState({localUser, connected});
    });
    socket.on('chat start', (data) => {
      console.log('chat started!!')
      var room = data.room;
      var remoteUser = data.name;
      var remoteVideo;
      console.log('started chatting!');
      this.state.peerToPeer.createConnection();
      this.setState({remoteUser, room, remoteVideo});
    });
    socket.on('video', (video) => {
      console.log(video);
    })
    socket.on('message', (data) => {
      console.log(data);
      var messages = this.state.messages;
      messages.push(data);
      this.setState({messages});
    });
    socket.on('Chat End', () => {
      console.log('disconnected!');
      var remoteUser = "No One!";
      var messages = [];
      this.setState({remoteUser, messages});
    });
    socket.on('video', (video) => {
      let remoteVideo = video;
      this.setState({remoteVideo});
    });

  }

  componentDidUpdate() {
    console.log(`REMOTE STREAM!:   :::::`)
    console.log(this.state.peerToPeer);
    var localVideo = this.state.peerToPeer.localStream;
    if(localVideo && this.state.checked) {
      var checked = false;
      this.setState({localVideo, checked});
    }
  }

  componentDidMount() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
    if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true, audio: false}, this.handleVideo, this.videoError);
    }
  }

  handleVideo(video) {
    var localVideo = '';
    this.setState({localVideo});
  }

  videoError() {
    console.log('error connecting!');
  }

  handleChange(e) {
    this.setState({value: e.target.value});
  }

  messageSubmit(e) {
    e.preventDefault();
    socket.emit('message', this.state.value);
    let messages = this.state.messages;
    messages.push(this.state.value);
    this.setState({value: '', messages});
  }

  newConnection() {
    console.log(this.state.connected);
    if(this.state.connected) {
      console.log('Looking for new user');
      socket.emit('leave room');
      var messages = [''];
      this.setState({messages});
    }
  }

  render() {
    return(
      <div>
        <div className="individualChat">
          <div className="localUser">
            <h4>My localUser: {this.state.localUser}</h4>
          </div>
          <div className="connectedWith">
            <h1>Chatting With: {this.state.remoteUser}</h1>
          </div>
          <ul className="messages">
            {this.state.messages.map((message, index) => {
              return <li key={index}>{message}</li>;
              })}
            </ul>
            <form onSubmit={this.messageSubmit}>
              <input className="messageInput" type="text" value={this.state.value} onChange={this.handleChange}/>
              <button>Send</button>
            </form>
            <video id="localStream" src={this.state.localVideo} autoPlay="true" />
            <button className="leaveChat" onClick={this.newConnection} />
            <video id="remoteStream" src={this.state.remoteVideo} autoPlay="true" />
        </div>
        <MainScene />
      </div>
    );
  }
}

export default Main;
