import React, { Component } from 'react';
import { render } from 'react-dom';
import paper from 'paper';

import Main from './Main.jsx';

class MainPageScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberOfUsers: 0,
    };
  }

  componentDidMount() {
    var mainPageCanvas = document.getElementById('mainPage');
    paper.setup(mainPageCanvas);
    console.log(paper.view.size);
    var width = paper.view.size.width;
    var height = paper.view.size.height;
    console.log(`WIDTH: ${width}, HEIGHT: ${height}`);
    var circle = new paper.Shape.Circle({
      center: [width / 2, height / 2],
      fillColor: 'grey',
      radius: 20
    });
    paper.view.draw();
  }

  render() {
    return(
      <canvas id="mainPage" width={window.innerWidth} height={window.innerHeight} />
    );
  }
}

export default MainPageScene;
