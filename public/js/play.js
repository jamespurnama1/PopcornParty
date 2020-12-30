let userName = localStorage.getItem('name');
let socket = io.connect();
let room = localStorage.getItem('roomId');
let url = localStorage.getItem('url');
let sub = localStorage.getItem('sub');
let share = localStorage.getItem('share');
let vol = 1;

function htmlClean(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shareLink() {
	let dummy = document.createElement('textarea');
	document.body.appendChild(dummy);
	dummy.value = share;
	dummy.select();
	document.execCommand('copy');
	document.body.removeChild(dummy);
	$('ul').append("<li class='list-group-item' data-toggle='tooltip' title='" + share + "'>" + "Link copied to clipboard!</li>");
	$('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
}

function videoSetup() {
  $('#video').attr('src', url);
  $('track').attr('src', sub);
  // $('#video').on('load', () => {
  //   const tracks = video.textTracks[0];
  //   tracks.mode = 'showing';
  //   $('#video').play();
  //   $('#video').pause();
  //   $('#video').currentTime = 0;
  // });
}

let chat = true;
function toggleChat() {
  if (chat) {
    $('#chatter').css('right', '-25vw');
    $('.vidClass').css('width', '100vw');
    $('#video').css('width', '93vw');
    $('#hide').html('< Show Chat');
    chat = false;
  } else {
    $('#chatter').css('right', '0');
    $('.vidClass').css('width', '80%');
    $('#video').css('width', '90%');
    $('#hide').html('Hide Chat >');
    chat = true;
  }
}

function sendMessage() {
  let messageTo = $('#message').val();
  if (messageTo == '') {
  } else {
    let message = htmlClean(messageTo);
    socket.emit('Message', {
      message: message,
      username: userName,
      room: room,
    });
    $('#message').val('');
    $('#sendAudio')[0].volume = vol - 0.5;
    $('#sendAudio')[0].play();
  }
}

socket.on('Inbox', (data) => {
  let textMessage = data.username + ' : ' + data.message;
  $('ul').append("<li class='list-group-item'>" + textMessage + '</li>');
  $('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
  $('#notification')[0].volume = vol - 0.5;
  $('#notification')[0].play();
});

socket.emit('join room', {
  message: 'Join room',
  username: userName,
  room: room,
});

socket.on('joined', (i) => {
  $('ul').append(
    "<li class='list-group-item' style='color: black; background-color: lightgray;'>" +
      i.username +
      ' joined the room.</li>'
  );
  $('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
  $('#notification')[0].volume = vol - 0.5;
  $('#notification')[0].play();
});

socket.on('PauseVideo', (i) => {
  $('ul').append(
    "<li class='list-group-item' style='color: white; background-color: black;'>" +
      i.username +
      ' paused the playback.</li>'
  );
  $('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
  $('#notification')[0].volume = vol - 0.7;
  $('#notification')[0].play();
  $('#video')[0].pause();
});

socket.on('PlayVideo', (i) => {
  $('ul').append(
    "<li class='list-group-item' style='color: white; background-color: black;'>" +
      i.username +
      ' clicked play.</li>'
  );
  $('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
  $('#notification')[0].volume = vol - 0.7;
  $('#notification')[0].play();
  $('#video')[0].play();
});

socket.on('SyncPlayback', (i) => {
  $('ul').append(
    "<li class='list-group-item' style='color:rgb(255, 122, 70); background-color: rgb(255, 255, 98);'>" +
      i.username +
      ' synced video playback.</li>'
  );
  $('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
  $('#notification')[0].volume = vol - 0.5;
  $('#notification')[0].play();
  let timePlay = i.message;
  $('#video')[0].currentTime = timePlay;
});

function stopNotification() {
  if (vol === 1) {
    vol = 0;
    $('.mute').css({ 'background-color': '#ff4f4f', color: 'white' });
    $('#stopNotification').val('Unmute Notifications');
  } else {
    vol = 1;
    $('.mute').css({ 'background-color': 'lightgray', color: 'black' });
    $('#stopNotification').val('Mute Notifications');
  }
}

let networkstate;
let videostate;

function checkNetwork() {
  switch (document.getElementById('video').networkState) {
    case 0:
      networkstate = 'no network';
      break;
    case 1:
      networkstate = 'network idle';
      break;
    case 2:
      networkstate = 'network loading';
      break;
    case 3:
      networkstate = 'no media source';
      break;
  }

  switch (document.getElementById('video').readyState) {
    case 0:
      videostate = 'no media info';
      break;
    case 1:
      videostate = 'have metadata';
      break;
    case 2:
      videostate = 'have exactly current playback';
      break;
    case 3:
      videostate = 'slightly have future playback';
      break;
    case 4:
      videostate = 'video is ready';
      break;
  }
}

function PlayVideo() {
  checkNetwork();
  if (document.getElementById('video').readyState > 4) {
    console.log('!!');
    $('ul').append(
      "<li style='color: white; background-color:#ff4f4f;' class='list-group-item'>[PLEASE WAIT] Network state: " +
        networkstate +
        '. Video state:' +
        videostate +
        '. Check your network connection.</li>'
    );
    $('ul').animate({ scrollTop: $('ul').prop('scrollHeight') }, 1000);
    playV();
  } else {
    playV();
  }
}

function playV() {
  socket.emit('PlayVideo', {
    message: 'Play Video',
    username: userName,
    room: room,
  });
}

function PauseVideo() {
  socket.emit('PauseVideo', {
    message: 'Pause Video',
    username: userName,
    room: room,
  });
}

// let syncStopper;

function syncUp() {
  let timeToSync = video.currentTime;
  socket.emit('SyncPlayback', {
    message: timeToSync,
    username: userName,
    room: room,
	});
	// syncStopper = true;
}

$(document).ready(() => {
	// let debounce;
  // let count = 0;
  // let debounceCount = 0;
	// $('#video').on('seeking', () => {
	// 	count++;
  //   // Clear any existing debounce event
  //   clearTimeout(debounce);
  //   // Update and log the counts after 3 seconds
  //   setTimeout(function () {
  //     // Update the debounceCount
  //     debounceCount++;
	// 		// Log the counts to the console
	// 		if(syncStopper = false) {
	// 		$('#video')[0].pause()
	// 			syncUp();
	// 		} else {
	// 			syncStopper = true;
	// 		}
  //   }, 1000);
	// })
  checkNetwork();
  $('[data-toggle="tooltip"]').tooltip();
  $('h3').html('Welcome to ' + room + ' room!');
  $('title').html(room + ' | PopcornParty');
});
