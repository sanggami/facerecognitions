import React, { Component } from 'react';
import Particles from 'react-particles-js';// import first in cmd as tachyons
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank'; // to make rank part in webpage 
import './App.css';

//You must add your own API key here from Clarifai. 
//sign in in clarifai and install like tachyons and we have our own api key from there copy and use at appkey:*******
//app declared below will be defined for onbuttonsubmit part (app.models)
/* particle is called from render part; * value = no. of particle* */

const particlesOptions = {
  particles: {
    number: {
      value: 30, 
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState=  {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin', //route keep tracks of where we are in page
      isSignedIn: false,
      // user that enters to our site and their data ; done during server connection
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
}

// update user and it link with signin & register
  
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }
//   calculateFaceLocation = (data) => {
//     const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;//the way we look and get o/p details when we look in developer tool
//     const image = document.getElementById('inputimage');//doing DOM manipulation and related inputimage id in facerecognition
//     const width = Number(image.width);// bounding box is percentage of image so width and height to grab images width & height of image
//     const height = Number(image.height);
//     // return the bounding box value where what property can be viewed in model of clarifai 
//     // leftcol %of width; toprow,bottomrow=> %of height; rightcol= total width -%of width; ,bottomrow=>total height - %of height
//     return {
//       leftCol: clarifaiFace.left_col * width,
//       topRow: clarifaiFace.top_row * height,
//       rightCol: width - (clarifaiFace.right_col * width),
//       bottomRow: height - (clarifaiFace.bottom_row * height)
//     }
//   }
// // return box 
//   displayFaceBox = (box) => {
//     this.setState({box: box});
//   }

//from input which is in class extends app from component and event.target.value helps to get value which we type as i/p in the detect box
  onInputChange = (event) => {
    this.setState({input: event.target.value});//this.setState helps to get image
  }
// when detect button is clicked
// app.models few lines (and later destructed as needed) is taken from clarify model=> facerecognition => js code

// clarify.face detect model can be get to know from github (<= search npm clarifai and select github link) there select src=> index.js(list of model can be get)
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});// sends the different image url entered in search to recognise
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify ({
        input: this.state.input
      })
    })
    .then(response=>response.json())
    // if state.imageurl we get error bcuz when state is used
      //error part from model clarify which is destructed
    .then(response => {
        if (response) {
          // fetch here connect to server 
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify ({
              id: this.state.user.id
            })
          })
          // make entry count change thaat is update on entries
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))

      })
      .catch(err => console.log(err));//error part from model clarify which is destructed
  }
// for purpose of signin
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div ref={this.wrapper}>{this.props.children}
      <div className="App">
         <Particles className='particles' 
         /* particles from particles react that we import get used here which is a running like animation in page*/ 
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm
                onInputChange={this.onInputChange} // this has to be used because oninput change is a property
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div>
          : (
             route === 'signin'
             ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
             : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
      </div>
    );
  }
}

export default App;
