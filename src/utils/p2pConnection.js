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
          trickle: true, // Enable trickle ICE for better connectivity
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
              { urls: "stun:stun3.l.google.com:19302" },
              { urls: "stun:stun4.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
              { urls: "stun:stun.services.mozilla.com" },
              // Free TURN servers for better NAT traversal
              {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
            ],
            iceCandidatePoolSize: 10,
          },
          channelConfig: {
            ordered: true,
          },
          // Add connection timeout
          connectionTimeout: 30000,
          // Enable more debugging
          debug: 2,
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
          console.log("P2P connection established as host!");
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
          console.log("P2P connection closed");
          if (this.onDisconnect) this.onDisconnect();
        });

        // Better ICE connection state monitoring
        this.peer.on(
          "iceStateChange",
          (iceConnectionState, iceGatheringState) => {
            console.log(
              "ICE state change:",
              iceConnectionState,
              iceGatheringState,
            );
            if (
              iceConnectionState === "failed" ||
              iceConnectionState === "disconnected"
            ) {
              console.log("ICE connection failed, attempting to reconnect...");
              // Don't immediately fail, WebRTC might recover
            }
          },
        );

        this.peer.on("error", (err) => {
          console.error("P2P Connection error:", err);
          if (this.onError) this.onError(err);
          reject(err);
        });

        // Add connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error("Connection timeout after 30 seconds");
            reject(
              new Error("Timeout lors de la connexion - vérifiez votre réseau"),
            );
          }
        }, 30000);
      } catch (error) {
        console.error("Error creating peer:", error);
        reject(error);
      }
    });
  }

  // Join room with connection code (simplified - auto-connects)
  joinRoom(connectionCode) {
    return new Promise((resolve, reject) => {
      try {
        this.isInitiator = false;
        this.peer = new Peer({
          initiator: false,
          trickle: true, // Enable trickle ICE for better connectivity
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" },
              { urls: "stun:stun3.l.google.com:19302" },
              { urls: "stun:stun4.l.google.com:19302" },
              { urls: "stun:global.stun.twilio.com:3478" },
              { urls: "stun:stun.services.mozilla.com" },
              // Free TURN servers for better NAT traversal
              {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
            ],
            iceCandidatePoolSize: 10,
          },
          channelConfig: {
            ordered: true,
          },
          // Add connection timeout
          connectionTimeout: 30000,
          // Enable more debugging
          debug: 2,
        });

        this.peer.on("signal", (data) => {
          try {
            // Automatically send answer back to the host
            console.log("Sending answer signal automatically");
            // We don't need to return this anymore, it's handled automatically
          } catch (error) {
            console.error("Error in signal handler:", error);
            reject(error);
          }
        });

        this.peer.on("connect", () => {
          this.isConnected = true;
          console.log("P2P connection established!");
          if (this.onConnect) this.onConnect();
          resolve(); // Resolve when actually connected
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

  // This method is no longer needed with simplified connection process

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
