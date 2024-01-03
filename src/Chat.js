import React, { useContext, useEffect, useRef, useState } from 'react';
import './Chat.css';
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext } from './UserContext';
import { uniqBy } from 'lodash';


export default function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [current, setCurrent] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([])
    const { id, user, setId, setUser } = useContext(UserContext);
    const scrollB = useRef();
    const currentRef = useRef(current);
    const fileInputRef = useRef(null);

    function handleSelect(userId) {
        setCurrent(userId);
    }
    useEffect(() => {
        reconnectServer()
    }, [])

    function reconnectServer() {
        const ws = new WebSocket('ws://localhost:4000')
        setWs(ws);
        ws.addEventListener('message', handleMsg);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                reconnectServer();
            }, 1000);
        })
    }

    function handleMsg(e) {
        const messageData = JSON.parse(e.data);
        if ('online' in messageData) {
            showOnline(messageData.online)
        }
        else if ('text' in messageData) {
            if (messageData.sender === currentRef.current) {
                setMessages(prev => [...prev, { ...messageData }])
            }
        }
    }

    function showOnline(peopleArray) {
        const people = {}
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username
        });
        setOnlinePeople(people)
    }

    const excludingOur = { ...onlinePeople }
    delete excludingOur[id];

    function submit(file = null) {
        ws.send(JSON.stringify({
            receiver: current,
            text: newMessage,
            file,
        }))
        setNewMessage('');
        setMessages(prev => [...prev, {
            text: newMessage,
            sender: id,
            receiver: current,
            _id: Date.now(),
        }])
        if (file) {
            async function fileCall() {
                try {
                    const response = await fetch(`http://localhost:4000/messages/${current}`, {
                        method: 'GET',
                        credentials: 'include'
                    });
                    const result = await response.json();
                    setMessages(result);
                }
                catch (err) {
                    console.error(err);
                }
            }
            fileCall()

        }
    }

    function handleAttach() {
        fileInputRef.current.click();
    }

    function handleFileChange(e) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            submit({
                name: e.target.files[0].name,
                data: reader.result,
            })
        }
    }

    useEffect(() => {
        if (messages.length > 0) {
            scrollB.current.scrollTop = scrollB.current.scrollHeight
        }
    }, [messages]);

    useEffect(() => {
        async function grabOff() {
            const response = await fetch('http://localhost:4000/people', {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json()
            const offlineArr = result.filter(p => !Object.keys(onlinePeople).includes(p._id));
            const offlineObj = {}
            offlineArr.forEach(p => {
                offlineObj[p._id] = p.username
            })
            setOfflinePeople(offlineObj)
        }
        grabOff()
    }, [onlinePeople])


    useEffect(() => {
        async function messageAPI() {
            try {
                const response = await fetch(`http://localhost:4000/messages/${current}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                const result = await response.json();
                setMessages(result);
            }
            catch (err) {
                console.error(err);
            }
        }
        if (current) {
            messageAPI()
        }
        currentRef.current = current;
    }, [current])

    const style1 = {
        backgroundColor: '#c5c2dd'
    }
    const style2 = {
        backgroundColor: 'inherit'
    }

    const users = Object.keys(excludingOur).map((c) => {
        return <div key={c} className='users' onClick={() => handleSelect(c)} style={c === current ? style1 : style2}>
            {current === c && <div className='side'></div>}
            <Avatar userData={{ username: excludingOur[c], userId: c, online: true }} />
            {excludingOur[c]}
        </div>;
    });

    const usersOffline = Object.keys(offlinePeople).map((c) => {
        return <div key={c} className='users' onClick={() => handleSelect(c)} style={c === current ? style1 : style2}>
            {current === c && <div className='side'></div>}
            <Avatar userData={{ username: offlinePeople[c], userId: c, online: false }} />
            {offlinePeople[c]}
        </div>;
    });

    const messageWithoutDupes = uniqBy(messages, '_id');
    function messageOur(e) {
        const style = {
            backgroundColor: e ? 'blue' : 'grey',
            color: e ? 'white' : 'black',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '10px',
            marginLeft: e ? 'auto' : '',
            marginRight: !e ? 'auto' : '',
        }
        return style
    }

    async function logout() {
        await fetch('http://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include',
        })
        setId(null);
        setUser(null);
    }

    return (
        <div className="two-column-container">
            <div className="left-column">
                <Logo />
                {users}
                {usersOffline}
                <div className='logout'>
                    <span>{user}</span>
                    <button onClick={logout}>logout</button>
                </div>
            </div>
            <div className="right-column">
                {!current
                    ?
                    <div className='center'>
                        <Logo value={true} />
                    </div>
                    :
                    <div className='forms' ref={scrollB}>
                        {messageWithoutDupes.map((message, i) => (<div key={i} style={id === message.sender ? messageOur(true) : messageOur(false)}>
                            {message.text}
                            {message.file && (
                                <div className='mesg'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /> </svg>
                                    <a href={`http://localhost:4000/${message.file}`} style={id === message.sender ? { color: 'white' } : { color: 'black' }}>
                                        {message.file}
                                    </a>
                                </div>
                            )}

                        </div>))}
                        <div className='msg-input'>
                            <input type='text'
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder='Type your message here...' />
                            <div className='attach' onClick={handleAttach}>
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /> </svg>
                            </div>
                            <div className='send' onClick={() => submit()}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

