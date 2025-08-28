// src/context/UnreadContext.js
import React, { createContext, useContext, useState } from "react";

const UnreadContext = createContext();

export const UnreadProvider = ({ children }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotis, setUnreadNotis] = useState(0);

  const totalUnread = unreadMessages + unreadNotis;

  return (
    <UnreadContext.Provider
      value={{ unreadMessages, setUnreadMessages, unreadNotis, setUnreadNotis, totalUnread }}
    >
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => useContext(UnreadContext);
