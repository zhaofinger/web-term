import React, { useRef, useEffect, useState } from 'react';

import SockJS from 'sockjs-client';

import { Terminal as XTerminal } from 'xterm';
import 'xterm/css/xterm.css';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';



export default function Terminal() {
  const [terminalIns, setTerminalIns] = useState(null);
  const terminalRef = useRef(null);
  let socket = null;

  const copyShortcut = e => {
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      document.execCommand('copy');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const termIns = new XTerminal({
      allowTransparency: true,
      fontFamily: 'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
      fontSize: 14,
      theme: {
        background: '#15171C',
        foreground: '#ffffff73',
      },
      cursorStyle: 'underline',
      cursorBlink: false,
    });
    setTerminalIns(termIns);
  }, []);

  useEffect(() => {
    if (terminalRef.current && terminalIns) {
      const fitAddon = new FitAddon();
      if (!socket) socket = new SockJS('http://localhost:1024/terminal');
      terminalIns.loadAddon(fitAddon);
      terminalIns.loadAddon(new WebLinksAddon());
      terminalIns.attachCustomKeyEventHandler(copyShortcut);
      terminalIns.open(terminalRef.current);
      terminalIns.loadAddon(new AttachAddon(socket, true));
      terminalIns.focus();
      fitAddon.fit();
    }
  }, [terminalRef, terminalIns])
  return (
    <div style={{ width: '800px', height: '400px', margin: '20px auto' }} ref={terminalRef} />
  );
}