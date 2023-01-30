//Socket connect with route path of localhost 7070
const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '7001'
})

//Get my video
const myVideo = document.createElement('video');
//muted so that user can not hear his/her voice while video chat
myVideo.muted = true;

const peers = {}

//Other users can hear and see the user
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then(stream => {
    addVideoStream(myVideo, stream);
    //answer the call of other user
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    });
    socket.on('user-connected', userId => {
        //Argument userId and our own video stream
        connectToNewUser(userId, stream);
    })
});

//if user leave that room we will stop video stram of that user
socket.on('user-disconnected', userId => {
    //if call of that userId exist we close that call
    if (peers[userId]) peers[userId].close();
})

//conect to peer server
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

connectToNewUser = (userId, stream) => {
    //calling user with userId and sending our video stream
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    //send our own video stream and then they send back their video stream
    call.on('stream', userVideoStream => {
        //TAking the stream from other user we are calling
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })
    //uer id is equal to call made by user
    peers[userId] = call;
}

addVideoStream = (video, stream) => {
    //set source object equal to stream
    video.srcObject = stream;
    //when stream is loaded paly the video
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}