import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { showMessage } from "react-native-flash-message";
import QueueJob, { Worker } from "react-native-job-queue";

const WORKER_NAME = "sync-with-server";

type QueuedRequest = {
  request: {
    url: string;
    body?: object;
    method: string;
  };
};

export function addJob(payload: QueuedRequest) {
  QueueJob.addJob(WORKER_NAME, payload, undefined, false);
}

function OfflineQueue() {
  const { isConnected } = useNetInfo();

  useEffect(() => {
    if (!isConnected) {
      showMessage({
        duration: 5000,
        message: "Você ficou offline",
        type: "danger",
      });
    } else {
      showMessage({
        duration: 5000,
        message: "Você esta online novamente",
        type: "success",
      });
    }

    async function startQueue() {
      const jobs = await QueueJob.getJobs();
      if (isConnected === false && jobs.length > 0) {
        console.log("starting queue");
        QueueJob.start();
      }
    }

    startQueue();
  }, [isConnected]);

  useEffect(() => {
    async function setupQueue() {
      try {
        console.log("isConnected", isConnected);
        QueueJob.configure({
          concurrency: 1,
          onQueueFinish: () => {
            console.log("queue finished");
          },
        });
        const workers = QueueJob.registeredWorkers;

        if (!(WORKER_NAME in workers)) {
          QueueJob.addWorker(
            new Worker(
              WORKER_NAME,
              async (payload: QueuedRequest, workerId) => {
                console.log(`running ${workerId}...`);
                console.log("sending request", payload.request.url);

                await new Promise((resolve) => setTimeout(resolve, 2000));
              },
              {
                concurrency: 1,
                onFailure: (job, error) => {
                  console.log("completed job", job.id);
                  console.log(error);
                },
                onCompletion: (job) => {
                  console.log("job failed", job.id);
                },
              }
            )
          );
        }
      } catch (error) {
        console.log(error);
      }
    }

    setupQueue();
  }, []);

  return null;
}

export default OfflineQueue;
