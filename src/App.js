import React from 'react';
import UserContextProvider from './UserContext';
import Routes from './Routes';

export default function App(){
  return(
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}