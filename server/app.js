const Koa = require('koa');
const cors = require('koa2-cors');
const pty = require('node-pty');
const sockjs = require('sockjs');

const app = new Koa();
const terminalWS = sockjs.createServer();

const getDefaultShell = () => {
  if (process.platform === 'darwin') {
    return process.env.SHELL || '/bin/bash';
  }

  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/sh';
};

terminalWS.on('connection', connectionIns => {
  const ptyProcess = pty.spawn(getDefaultShell(), [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    },
  });
  ptyProcess.onData(chunk => {
    connectionIns.write(chunk);
  });
  connectionIns.on('data', data => {
    console.log('receice data: ', data);
    ptyProcess.write(data);
  });
  connectionIns.on('close', () => {
    ptyProcess.kill();
  });
});

app.use(cors({
  origin: 'http://localhost:3002',
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
}));

const server = app.listen('1024');

terminalWS.installHandlers(server, {
  prefix: '/terminal',
  log: () => {},
});