import React, { useEffect, useState } from 'react';
import getSocket from '../../utils/util';
import { useRecoilValue } from 'recoil';
import { UsernameState } from '../../recoil/atoms';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';

function Chatting({ roomId, setRoomId }) {
  const username = useRecoilValue(UsernameState);
  const [roomInfo, setRoomInfo] = useState({});
  const [userEditInput, setUserEditInput] = useState({
    roomTitle: '',
    roomPw: '',
    roomCapacity: 0,
  });
  const [userUpdate, setUserUpdate] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatData, setChatData] = useState([]);

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setUserEditInput({ ...userEditInput, [name]: value });
  };

  const handleEditButton = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const { roomTitle, roomPw, roomCapacity } = userEditInput;
    if (roomTitle === '') {
      alert('Enter a valid name');
      return;
    } else if (!roomCapacity) {
      alert('Enter valid room capacity');
      return;
    }
    const roomDto = {
      ...roomInfo,
      roomTitle,
      roomPw: roomPw || null,
      roomCapacity: parseInt(roomCapacity),
    };
    console.log(roomDto);
    getSocket().then((socket) => {
      socket.emit('room.update', roomDto, (res) => {
        if (res.result) {
          closeEditModal();
          setUserUpdate(true);
        } else {
          alert('Failed to leave room');
        }
      });
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setUserEditInput({
      roomTitle: roomInfo.roomTitle,
      roomPw: '',
      roomCapacity: roomInfo.roomCapacity,
    });
  };

  const handleLeave = () => {
    getSocket().then((socket) => {
      socket.emit('room.leave', (res) => {
        if (res.result) {
          setRoomId(null);
        } else {
          alert('Failed to leave room');
        }
      });
    });
  };

  const getRoomInfo = () => {
    getSocket().then((socket) => {
      socket.emit('room.info', (res) => {
        setRoomInfo(res.packet);
        const { roomTitle, roomCapacity } = res.packet;
        setUserEditInput({ ...userEditInput, roomTitle, roomCapacity });
      });
    });
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleSendChat = () => {
    const chatDto = {
      from: username,
      to: null,
      text: chatInput,
      type: 'all',
    };
    console.log(chatDto);
    getSocket().then((socket) => {
      socket.emit('chat.out', chatDto, (res) => {
        console.log(res);
      });
    });
    setChatInput('');
    setChatData([...chatData, chatDto]);
  };

  useEffect(() => {
    getRoomInfo();

    return () => {
      getSocket().then((socket) => {
        socket.emit('room.leave', (res) => {
          if (!res.result) {
            alert('Failed to leave room');
          }
        });
      });
    };
  }, []);

  useEffect(() => {
    if (userUpdate) {
      console.log('user update');
      getRoomInfo();
      setUserUpdate(false);
    }
  }, [userUpdate]);

  useEffect(() => {
    getSocket().then((socket) => {
      socket.on('chat.in', (res) => {
        if (res.result) {
          console.log(res.packet);
          setChatData([...chatData, res.packet]);
        } else {
          setChatData([...chatData, res]);
        }
      });
    });
  }, [chatData]);

  if (!roomInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <button onClick={handleLeave}>Leave room</button>
      <p>Currently in room {roomId}</p>
      <p>
        {roomInfo.roomOwner === username && (
          <button onClick={handleEditButton}>정보 바꾸기</button>
        )}
      </p>

      <div>
        {chatData.map((chat, i) => (
          <p key={i}>
            From: {chat.from || 'NULL'}
            To: {chat.to || 'EVERYONE'}
            {chat.text}
          </p>
        ))}
      </div>

      <input type="text" value={chatInput} onChange={handleChatInputChange} />
      <button onClick={handleSendChat}>보내기</button>

      {/* Modal */}
      <Rodal visible={showEditModal} onClose={closeEditModal}>
        <form>
          <div>
            <label>Room name:</label>
            <input
              type="text"
              name="roomTitle"
              value={userEditInput.roomTitle}
              onChange={handleEditInputChange}
            />
          </div>
          <div>
            <label>Room password:</label>
            <input
              type="password"
              name="roomPw"
              value={userEditInput.roomPw}
              onChange={handleEditInputChange}
            />
          </div>
          <div>
            <label>Room capacity:</label>
            <input
              type="number"
              name="roomCapacity"
              value={userEditInput.roomCapacity}
              onChange={handleEditInputChange}
            />
          </div>
          <button type="submit" onClick={handleEditSubmit}>
            수정
          </button>
        </form>
      </Rodal>
    </div>
  );
}

export default Chatting;
