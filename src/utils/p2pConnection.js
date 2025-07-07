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

  // Get improved WebRTC configuration
  getWebRTCConfig() {
    return {
      initiator: false, // Will be overridden
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
          {
            urls: "turn:openrelay.metered.ca:80?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      },
      channelConfig: {
        ordered: true,
      },
    };
  }

  // Set up common event handlers for peer connection
  setupPeerEvents(peer, resolve, reject, connectionTimeout) {
    peer.on("signal", (data) => {
      try {
        console.log("Signal generated, sharing connection code");
        if (this.isInitiator) {
          // Return the connection code for sharing with other player
          resolve(JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error in signal handler:", error);
        clearTimeout(connectionTimeout);
        reject(error);
      }
    });

    peer.on("connect", () => {
      this.isConnected = true;
      console.log(
        `P2P connection established as ${this.isInitiator ? "host" : "guest"}!`,
      );
      clearTimeout(connectionTimeout);
      if (this.onConnect) this.onConnect();
      if (!this.isInitiator) {
        resolve(); // For joinRoom, resolve when connected
      }
    });

    peer.on("data", (data) => {
      try {
        if (this.onMessage) {
          const message = JSON.parse(data.toString());
          this.onMessage(message);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    peer.on("close", () => {
      this.isConnected = false;
      console.log("P2P connection closed");
      if (this.onDisconnect) this.onDisconnect();
    });

    // Better ICE connection state monitoring
    peer.on("iceStateChange", (iceConnectionState, iceGatheringState) => {
      console.log("ICE state change:", iceConnectionState, iceGatheringState);

      if (
        iceConnectionState === "connected" ||
        iceConnectionState === "completed"
      ) {
        console.log("ICE connection successful");
      } else if (iceConnectionState === "failed") {
        console.error("ICE connection failed definitively");
        const error = new Error(
          "Connexion impossible - problème de réseau (ICE failed)",
        );
        clearTimeout(connectionTimeout);
        if (this.onError) this.onError(error);
        reject(error);
      } else if (iceConnectionState === "disconnected") {
        console.warn("ICE connection disconnected, might recover...");
      }
    });

    peer.on("error", (err) => {
      console.error("P2P Connection error:", err);
      clearTimeout(connectionTimeout);
      let userFriendlyError;

      if (err.message && err.message.includes("Ice connection failed")) {
        userFriendlyError = new Error(
          "Connexion impossible - vérifiez votre réseau ou essayez depuis un autre réseau",
        );
      } else if (err.message && err.message.includes("Connection failed")) {
        userFriendlyError = new Error(
          "Échec de la connexion - le code est peut-être incorrect ou expiré",
        );
      } else {
        userFriendlyError = new Error(
          `Erreur de connexion: ${err.message || "Erreur inconnue"}`,
        );
      }

      if (this.onError) this.onError(userFriendlyError);
      reject(userFriendlyError);
    });
  }

  // Create connection as initiator (host)
  createRoom() {
    return new Promise((resolve, reject) => {
      try {
        this.isInitiator = true;
        const config = this.getWebRTCConfig();
        config.initiator = true;

        this.peer = new Peer(config);

        // Add connection timeout (45 seconds for better reliability)
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error("Connection timeout after 45 seconds");
            const timeoutError = new Error(
              "Timeout - la connexion prend trop de temps. Vérifiez votre réseau.",
            );
            if (this.onError) this.onError(timeoutError);
            reject(timeoutError);
          }
        }, 45000);

        this.setupPeerEvents(this.peer, resolve, reject, connectionTimeout);
      } catch (error) {
        console.error("Error creating peer:", error);
        reject(new Error("Erreur lors de la création de la connexion"));
      }
    });
  }

  // Join room with connection code (simplified - auto-connects)
  joinRoom(connectionCode) {
    return new Promise((resolve, reject) => {
      try {
        this.isInitiator = false;
        const config = this.getWebRTCConfig();
        config.initiator = false;

        this.peer = new Peer(config);

        // Add connection timeout (45 seconds for better reliability)
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error("Connection timeout after 45 seconds");
            const timeoutError = new Error(
              "Timeout - impossible de se connecter. Vérifiez le code et votre réseau.",
            );
            if (this.onError) this.onError(timeoutError);
            reject(timeoutError);
          }
        }, 45000);

        this.setupPeerEvents(this.peer, resolve, reject, connectionTimeout);

        // Signal with the connection code from host
        console.log("Attempting to connect with provided code...");
        const hostSignal = JSON.parse(connectionCode);
        this.peer.signal(hostSignal);
      } catch (err) {
        console.error("Error joining room:", err);
        reject(new Error("Code de connexion invalide ou erreur de format"));
      }
    });
  }

  // Send message to peer
  sendMessage(message) {
    if (this.peer && this.isConnected) {
      try {
        this.peer.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    }
    return false;
  }

  // Disconnect
  disconnect() {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
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
