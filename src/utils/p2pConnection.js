import Peer from "simple-peer";

export class P2PConnection {
  constructor() {
    this.peer = null;
    this.isConnected = false;
    this.isInitiator = false;
    this.onMessage = null;
    this.onConnect = null;
    this.onDisconnect = null;
    this.onError = null;
  }

  // Create connection as initiator (host)
  createRoom() {
    return new Promise((resolve, reject) => {
      try {
        this.isInitiator = true;
        this.peer = new Peer({
          initiator: true,
          trickle: false,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        });

        this.peer.on("signal", (data) => {
          try {
            // Return the connection code for sharing with other player
            resolve(JSON.stringify(data));
          } catch (error) {
            console.error("Error in signal handler:", error);
            reject(error);
          }
        });

        this.peer.on("connect", () => {
          this.isConnected = true;
          if (this.onConnect) this.onConnect();
        });

        this.peer.on("data", (data) => {
          try {
            if (this.onMessage) {
              const message = JSON.parse(data.toString());
              this.onMessage(message);
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });

        this.peer.on("close", () => {
          this.isConnected = false;
          if (this.onDisconnect) this.onDisconnect();
        });

        this.peer.on("error", (err) => {
          console.error("P2P Connection error:", err);
          if (this.onError) this.onError(err);
          reject(err);
        });
      } catch (error) {
        console.error("Error creating peer:", error);
        reject(error);
      }
    });
  }

  // Join room with connection code
  joinRoom(connectionCode) {
    return new Promise((resolve, reject) => {
      try {
        this.isInitiator = false;
        this.peer = new Peer({
          initiator: false,
          trickle: false,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
            ],
          },
        });

        this.peer.on("signal", (data) => {
          try {
            // Return answer signal to be shared back with host
            resolve(JSON.stringify(data));
          } catch (error) {
            console.error("Error in signal handler:", error);
            reject(error);
          }
        });

        this.peer.on("connect", () => {
          this.isConnected = true;
          if (this.onConnect) this.onConnect();
        });

        this.peer.on("data", (data) => {
          try {
            if (this.onMessage) {
              const message = JSON.parse(data.toString());
              this.onMessage(message);
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });

        this.peer.on("close", () => {
          this.isConnected = false;
          if (this.onDisconnect) this.onDisconnect();
        });

        this.peer.on("error", (err) => {
          console.error("P2P Connection error:", err);
          if (this.onError) this.onError(err);
          reject(err);
        });

        // Signal with the connection code from host
        const hostSignal = JSON.parse(connectionCode);
        this.peer.signal(hostSignal);
      } catch (err) {
        console.error("Error joining room:", err);
        reject(err);
      }
    });
  }

  // Complete connection for initiator
  completeConnection(answerCode) {
    return new Promise((resolve, reject) => {
      try {
        const answerSignal = JSON.parse(answerCode);
        this.peer.signal(answerSignal);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Send message to peer
  sendMessage(message) {
    if (this.peer && this.isConnected) {
      this.peer.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Disconnect
  disconnect() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
      this.isConnected = false;
    }
  }

  // Set event handlers
  setOnMessage(callback) {
    this.onMessage = callback;
  }

  setOnConnect(callback) {
    this.onConnect = callback;
  }

  setOnDisconnect(callback) {
    this.onDisconnect = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }
}

// Message types for game communication
export const MESSAGE_TYPES = {
  GAME_MOVE: "game_move",
  GAME_STATE: "game_state",
  GAME_RESET: "game_reset",
  PLAYER_READY: "player_ready",
  CHAT_MESSAGE: "chat_message",
  PING: "ping",
  PONG: "pong",
};

export default P2PConnection;
