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
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    });
    socket.on('user-connected', userId => {
        //Argument userId and our own video stream
        connectToNewUser(userId, stream);
    })
});

//if user leave that room we will stop video stram of that user
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);

});

connectToNewUser = (userId, stream) => {
    //calling user with userId and sending our video stream
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    //take other user video stream 
    call.on('stream', userVideoStream => {
        //TAking the stream from other user we are calling
        addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
        video.remove();
    })
    peers[userId] = call
}

addVideoStream = (video, stream) => {
    //allow us to play our video
    video.srcObject = stream;
    //when stream is loaded paly the video
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}