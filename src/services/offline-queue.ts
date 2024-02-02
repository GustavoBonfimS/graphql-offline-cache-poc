import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { hideMessage, showMessage } from "react-native-flash-message";

type QueuedRequest = {
  run: () => void;
  onError: () => void;
}

export const requestsInQueue: QueuedRequest[] = [];

function OfflineQueue() {
  const { isConnected } = useNetInfo();

  useEffect(() => {
    if (!isConnected) {
      showMessage({
        duration: 5000,
        message: "Você ficou offline",
        type: "info",
      });
    } else {
      showMessage({
        duration: 5000,
        message: "Você esta online novamente",
        type: "info",
      });
    }
  }, [isConnected]);

  return null;
}

export default OfflineQueue;
