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

export async function clearQueue() {
  // const jobs = await QueueJob.getJobs();
  // jobs.forEach(job => {
  //   QueueJob.cancelJob(job.id)
  // })
  QueueJob.removeWorker(WORKER_NAME, true)
}

function OfflineQueue() {
  const { isConnected } = useNetInfo();

  useEffect(() => {
    if (isConnected === false) {
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
      console.log('jobs length', jobs.length);
      if (jobs.length > 0) {
        console.log("starting queue");
        QueueJob.start();
      }
    }

    if (isConnected === true) {
      startQueue();
    }
  }, [isConnected]);

  useEffect(() => {
    async function setupQueue() {
      try {
        QueueJob.configure({
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

                // await new Promise((resolve) => setTimeout(resolve, 2000));
              },
              {
                onFailure: (job, error) => {
                  console.log("job failed", job.id);
                  console.log(error);
                },
                onCompletion: (job) => {
                  console.log("completed job", job.id);
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
