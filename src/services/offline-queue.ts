import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { showMessage } from "react-native-flash-message";
import QueueJob, { Worker } from "react-native-job-queue";
import BackgroundService from "react-native-background-actions";

const WORKER_NAME = "sync-with-server";

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

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

function setupWorker() {
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
}

export async function clearQueue() {
  QueueJob.removeWorker(WORKER_NAME, true);
  setupWorker();
}

async function startQueue() {
  if (BackgroundService.isRunning()) {
    return;
  }

  const jobs = await QueueJob.getJobs();
  console.log("jobs length", jobs.length);
  if (jobs.length > 0) {
    console.log("starting queue in background");
    await BackgroundService.start(
      async () => {
        await QueueJob.start();

        for (let i = 0; BackgroundService.isRunning(); i++) {
          console.log('running on background');
          console.log(i);
          await sleep(2000);
      }
      },
      {
        taskName: "sync offline data",
        taskDesc: "Sync data with server",
        taskTitle: "Sincronizando dados...",
        taskIcon: {
          name: "ic_launcher",
          type: "mipmap",
        },
      }
    );
    await BackgroundService.updateNotification({
      taskDesc: "Sync data with server",
      taskTitle: "Sincronizando dados...",
    });
  }
}
async function setupQueue() {
  try {
    QueueJob.configure({
      onQueueFinish: async () => {
        console.log("queue finished");
        await BackgroundService.stop();
      },
    });

    setupWorker();
  } catch (error) {
    console.log(error);
  }
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

    if (isConnected === true) {
      startQueue();
    }
  }, [isConnected]);

  useEffect(() => {
    setupQueue();
  }, []);

  return null;
}

export default OfflineQueue;
