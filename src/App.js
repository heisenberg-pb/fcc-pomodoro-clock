/* Import React modules */
import React from 'react';
import ReactDOM from 'react-dom';

/* Import stylesheet */
import './stylesheet.scss'

/* Import Font Awesome library modules and icons */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown, faPlay, faPause, faSyncAlt } from '@fortawesome/free-solid-svg-icons'

/* Audio URL */
const audioURL = 'https://bit.ly/2vb1NI1';

/* React componenets */
/* Layout components */
/* Title */
const Title = () => {
  return <div id='title'>
    <h1>Pomodoro Clock</h1>
  </div>
};

/* Label with increment-decrement controllers */
const Label = props => {
  var type = props.type;

  return <div className='label'>
    <div className='label-container'>
      {/* Incrementor */}
      <button id={`${type}-increment`} 
        className='control-btn'
        onClick={ () => props.handler('inc') }>
          <FontAwesomeIcon icon={faArrowUp} />
      </button>
      &nbsp;
      {/* Label */}
      <div id={`${type}-label`}  className='label-title'>
        {`${type} length`}
      </div>
      &nbsp;
      {/* Decrementor */}
      <button id={`${type}-decrement`} 
        className='control-btn'
        onClick={ () => props.handler('dcr') }>
          <FontAwesomeIcon icon={faArrowDown} />
      </button>
    </div>
    {/* Time */}
    <div id={`${type}-length`} className='time-length'>{props.length}</div>
  </div>
};

/* Timer */
const Timer = props => {
  return <div id='session-timer'>
    <div id='timer-label'>{ props.timerLabel }</div>
    <div id='time-left'>
      {`${props.time.minute}:${props.time.second}`}</div>
  </div>
};

/* Controllers */
const Controllers = props => {
  /* Button to render accornding to state */
  var playOrPause;
  if(!props.play) {
    playOrPause = faPlay;
  } else {
    playOrPause = faPause;
  }

  return <div id='controllers'>
    {/* Play or pause button */}
    <button className='control-btn' 
      id='start_stop'
      onClick={ props.playPauseHandler }>
        <FontAwesomeIcon icon={ playOrPause } /></button>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    {/* Reset button */}
    <button className='control-btn' 
      id='reset'
      onClick={ props.resetHandler }>
        <FontAwesomeIcon icon={faSyncAlt} /></button>
  </div>
};

/* Parent component */
class App extends React.Component {
  constructor(props) {
    super(props);
    /* State */
    this.state = {
      breakLength: '5',
      sessionLength: '25',
      timerLabel: 'Session',
      timeLeft: {
        minute: '25',
        second: '00'
      },
      play: false
    };

    /* Bind handlers */
    this.breakControlHandler = this.breakControlHandler.bind(this);
    this.sessionControlHandler = this.sessionControlHandler.bind(this);
    this.playPauseControlHandler = this.playPauseControlHandler.bind(this);
    this.resetControlHandler = this.resetControlHandler.bind(this);
    this.update = this.update.bind(this);

    /* Used to check if the timer is running or paused.
    By default: paused */
    this.play = false;

    /* Increment, decrement button disabled or enabled */
    this.controlsEnabled = true;

    /* Interval id */
    this.intervalId = undefined;
  }

  /* Handlers */
  /* Break length increment or decrement handler */
  breakControlHandler(operation) {
    // check if controls are enabled
    if(this.controlsEnabled) {
      // retrieve the current break length
      var length = +this.state.breakLength;
      var newLength = length;
      // check the operation
      if(operation == 'inc') {
        // increment break length
        // can't set greater than 60 minutes
        if(length < 60) {
          newLength += 1;
        }
      } else {
        // decrement the length
        // can't set less than one minute
        if(length > 1) {
          newLength -= 1;
        }
      }

      // update the state
      this.setState({
        breakLength: newLength.toString()
      });
    }
  }

  /* Session Length increment or decrement handler */
  sessionControlHandler(operation) {
    // check if controls are enabled
    if(this.controlsEnabled) {
      // retrieve the current session length
      var length = +this.state.sessionLength;
      var newLength = length;
      // check the operation
      if(operation == 'inc') {
        // increment break length
        // can't set greater than 60 minutes
        if(length < 60) {
          newLength += 1;
        }
      } else {
        // decrement the length
        // can't set less than one minute
        if(length > 1) {
          newLength -= 1;
        }
      }

      // update the state and update the time-left too
      this.setState({
        sessionLength: newLength.toString(),
        timeLeft: {
          minute: newLength.toString(),
          second: '00'
        }
      });
    }
  }

  /* Play-pause handler */
  playPauseControlHandler() {
    // if timer is not running
    if(!this.state.play) {
      // set play to true
      this.setState({
        play: true
      });
      // diable the controls
      this.controlsEnabled = false;
      // start the timer
      this.intervalId = setInterval(this.update, 1000);
    } else {
      // set play to false
      this.setState({
        play: false
      });
      // enable the controls 
      this.controlsEnabled = true;
      // stop the timer
      clearInterval(this.intervalId);
    }
  }

  /* Updates the timer */
  update() {
    // Retrieve the time left and convert to number
    var minute = +this.state.timeLeft.minute;
    var second = +this.state.timeLeft.second;
    // if minute is not zero
    if(minute >= 0) {
      /* if second is zero, decrement minute by one, set
      second to 59; else decrement second by one */
      if(minute != 0 && second == 0) {
        second = 59;
        minute -= 1;
      } else if(second > 0) {
        second -= 1;
      }
    }

    // convert to formatted string
    minute = this.getFormatted(minute);
    second = this.getFormatted(second);

    // update state
    this.setState({
      timeLeft: {
        minute: minute,
        second: second
      }
    });
    
    /* if time reaches clear the interval and fire the alarm,
    and take appropiate action */
    if(minute == '00' && second == '00') {
      clearInterval(this.intervalId);
      this.fireAlarm();
      // if session was running change to break else change to session
      if(this.state.timerLabel == 'Session') {
        /* wait for 3 seconds, call the change timer-type handler */
        setTimeout(() => this.changeTimerType('Break'), 3000);
      } else {
        setTimeout(() => this.changeTimerType('Session'), 3000);
      }
    }
  }

  /* Timer type changer */
  changeTimerType(type) {
    /* set timer length according to type */
    if(type == 'Break') {
      var minute = this.state.breakLength;
    } else {
      minute = this.state.sessionLength;
    }

    // update state
    this.setState({
      timeLeft: {
        minute: minute,
        second: '00'
      },
      timerLabel: type
    });
    
    // update
    this.intervalId = setInterval(this.update, 1000);
  }

  /* Returs two digit string of the argument */
  getFormatted(arg) {
    // convert to string
    arg = arg.toString();
    /* if length is already 2, return arg; else append zero
    at begining of the arg and return it */
    if(arg.length == 2) {
      return arg;
    } else {
      return '0'+arg;
    }
  }

  /* Plays the alarm */
  fireAlarm() {
    var audio = document.getElementById('beep');
    audio.play();
  }

  /* Reset handler */
  resetControlHandler() {
    // if timer is running stop it
    if(this.intervalId != undefined) {
      clearInterval(this.intervalId);
    }
    // enable control buttons
    this.controlsEnabled = true;
    // reset all lengths and timer
    this.setState({
      breakLength: '5',
      sessionLength: '25',
      timerLabel: 'Session',
      timeLeft: {
        minute: '25',
        second: '00'
      },
      play: false
    });

    // clear any timer interval
    clearInterval(this.intervalId);

    // reset the audio position
    var audio = document.getElementById('beep');
    audio.currentTime = 0;
  }

  render() {
    return <div>
      <audio id='beep' 
        src={ audioURL } />
      <Title />
      <div className='control'>
        <Label type='break' 
          length={ this.state.breakLength } 
          handler={ this.breakControlHandler } />
        <Label type='session' 
          length={ this.state.sessionLength } 
          handler={ this.sessionControlHandler } />
      </div>
      <Timer time={ this.state.timeLeft }
        timerLabel={ this.state.timerLabel } />
      <Controllers play={ this.state.play }
        playPauseHandler={ this.playPauseControlHandler }
        resetHandler={ this.resetControlHandler } />
    </div>
  }
}

/* Render components to the page */
const container = document.getElementById('app');
ReactDOM.render(<App />, container);