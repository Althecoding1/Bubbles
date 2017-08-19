import React, { Component } from 'react';
import { render } from 'react-dom';
import { newBubbleName } from '../../bubbleConnGen.js';

import MainScene from './MainScene.jsx';
import WebRTCconnection from './StunTurnController.jsx';
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
      room: '',
      chatStarted: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.messageSubmit = this.messageSubmit.bind(this);
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
      var chatStarted = true;
      console.log('started chatting!');
      this.setState({remoteUser, room, chatStarted});
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
            <video id="localVideo" autoPlay="true" />
            <video id="remoteVideo" autoPlay="true" />
            {this.state.chatStarted ? <WebRTCconnection start={this.state.chatStarted}/> : null}
            <button className="leaveChat" onClick={this.newConnection} />
        </div>
        <MainScene />
      </div>
    );
  }
}

export default Main;
