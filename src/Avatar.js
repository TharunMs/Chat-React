import React from 'react';
import './Avatar.css'

export default function Avatar(props) {
  const { username, userId, online } = props.userData;

  const colors = ['#FF5733', '#33FF57', '#5733FF', '#FF33A1', '#A133FF', '#33C9FF'];
  const user10 = parseInt(userId,16)
  const style = {
    backgroundColor : colors[user10%colors.length],
    color : 'white'
  }

  return (
    <div className='avatar-logo' style={style}>
        {online && <div className='online'></div>}
        {!online && <div className='offline'></div>}
        {username[0].toUpperCase()}
    </div>
  );
}
