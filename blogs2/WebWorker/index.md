```js
// mdn reference for WebWorker: https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api

const Worker = window.Worker;
const Blob = window.Blob;
const createObjectURL = window.URL.createObjectURL;
const revokeObjectURL = window.URL.revokeObjectURL;

/**
 * 根据传入的worker字符串模板创建对应的真正worker
 * @param {string} workerTemplate workerTemplate
 * @returns {{worker: Worker, workBlobURL: string}} a worker with its blobURL
 */
const createWorker = (workerTemplate) => {
  const workBlob = new Blob([workerTemplate], {
    type: "text/javascript",
  });
  const workBlobURL = createObjectURL(workBlob);
  const worker = new Worker(workBlobURL);
  return {
    worker,
    workBlobURL,
  };
};

/**
 * 一次性运行的worker
 * @param {Function} work a function named work to run in worker
 * @param {any} data data to the work
 * @returns {Promise} a promise to get the result from worker
 */
export const runDisposableWorker = (work, data) => {
  const workerTemplate = `
    self.onmessage = (e) => {
      // 收到message立刻执行任务，再将结果发出去
      self.postMessage(
        (${work})(e.data)
      )
      // 一次性的worker
      self.close()
    }
  `;
  const { worker, workBlobURL } = createWorker(worker);
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      resolve(e.data);
    };
    worker.onerror = (e) => {
      console.error("runDisposableWorker error:", e);
      reject(e);
    };
    worker.postMessage(data);
  }).finally(() => revokeObjectURL(workBlobURL));
};

/**
 * 返回一个能根据不同action执行不同任务的worker
 * @param {{action: string, work: Function, default?: any}[]} actions actions make the worker can accept a set of action
 * @returns {{post: Function, postAll: Function, closeL Function}} a worker contoller
 */
export const runActionsWorker = (actions) => {
  const workerTemplate = `
    self.onmessage = (e) => {
      const actions = [${actions.map(
        ({ action, work }) =>
          `{ action: '${action}', work: ${work.toString()} }`
      )}]
      const action = actions.find(i
      ```