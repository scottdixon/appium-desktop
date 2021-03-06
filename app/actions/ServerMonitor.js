import { ipcRenderer } from 'electron';
import { push } from 'react-router-redux';

export const SERVER_STOP_REQ = 'SERVER_STOP_REQ';
export const SERVER_STOP_OK = 'SERVER_STOP_OK';
export const SERVER_STOP_FAIL = 'SERVER_STOP_FAIL';
export const LOGS_RECEIVED = 'LOGS_RECEIVED';
export const LOGS_CLEARED = 'LOGS_CLEARED';
export const MONITOR_CLOSED = 'MONITOR_CLOSED';

export function stopServerReq () {
  return {type: SERVER_STOP_REQ};
}

export function stopServerOK () {
  return {type: SERVER_STOP_OK};
}

export function stopServerFailed (reason) {
  return {type: SERVER_STOP_FAIL, reason};
}

export function serverLogsReceived (logs) {
  return {type: LOGS_RECEIVED, logs};
}

export function monitorClosed () {
  return {type: MONITOR_CLOSED};
}

function stopListening () {
  ipcRenderer.removeAllListeners('appium-log-line');
  ipcRenderer.removeAllListeners('appium-stop-error');
}

export function stopServer () {
  return (dispatch) => {
    dispatch(stopServerReq());

    ipcRenderer.once('appium-stop-error', (event, message) => {
      alert(`Stop server failed: ${message}`);
      dispatch(stopServerFailed(message));
    });

    stopListening();

    ipcRenderer.once('appium-stop-ok', () => {
      dispatch(serverLogsReceived([{
        level: 'info',
        msg: "Appium server stopped successfully"
      }]));
      setTimeout(() => {
        dispatch(stopServerOK());
      }, 0);
    });

    ipcRenderer.send('stop-server');
  };
}

export function closeMonitor () {
  return (dispatch) => {
    dispatch(monitorClosed());
    dispatch(push("/"));
  };
}

export function clearLogs () {
  return (dispatch) => {
    dispatch({type: LOGS_CLEARED});
  };
}
