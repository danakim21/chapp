import React from 'react';
import getSocket from '../../utils/util';

function Chatting({ roomId, setRoomId }) {
  const handleLeave = () => {
    getSocket().then((socket) => {
      socket.emit('room.leave', (res) => {
        console.log(res);
        if (res.result) {
          setRoomId(null);
        } else {
          alert('Failed to leave room');
        }
      });
    });
  };

  return (
    <div>
      <button onClick={handleLeave}>Leave room</button>
      <p>Currently in room {roomId}</p>
    </div>
  );
}

export default Chatting;
