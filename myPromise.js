/**
 * Global param for state. to retrieve the status.
 */
const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

/**
 * Create a new custom of myPromise implementation.
 * @param executor callback used to initialize the promise. This callback is passed two arguments:
 * a resolve callback used to resolve the promise with a value or the result of another promise,
 * and a reject callback used to reject the promise with a provided reason or error.
 */
class myPromise {
  #thenCallbacks = [];
  #catchCallbacks = [];
  #state = STATE.PENDING;
  #value;
  #onSuccessBind = this.#onSuccess.bind(this);
  #onFailBind = this.#onFail.bind(this);

  constructor(callback) {
    try {
      callback(this.#onSuccess, this.#onFail);
    } catch (error) {
      this.#onFail(error);
    }
  }

  #runCallbacks() {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCallbacks.forEach((cb) => {
        cb(this.#value);
      });

      this.#thenCallbacks = [];
    }

    if (this.#state === STATE.REJECTED) {
      this.#catchCallbacks.forEach((cb) => {
        cb(this.#value);
      });

      this.#catchCallbacks = [];
    }
  }

  #onSuccess(value) {
    if (this.#state !== STATE.PENDING) return;

    this.#value = value;
    this.#state = STATE.FULFILLED;
    this.#runCallbacks();
  }

  #onFail(value) {
    if (this.#state !== STATE.PENDING) return;

    this.#value = value;
    this.#state = STATE.REJECTED;
    this.#runCallbacks();
  }

  /**
   * Adds a callback function to be executed when the promise is fulfilled.
   * @param {function} thenCallback - The callback function to be executed on fulfillment.
   * @param {function} catchCallback - The callback function to be executed on rejection.
   * @returns {myPromise} - A new myPromise instance.
   */
  then(thenCallback, catchCallback) {
    return new myPromise((resolve, reject) => {
      this.#thenCallbacks.push((result) => {
        if (thenCallback == null) {
          resolve(result);
          return;
        }

        try {
          resolve(thenCallback(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#catchCallbacks.push((result) => {
        if (catchCallback == null) {
          reject(result);
          return;
        }

        try {
          resolve(catchCallback(result));
        } catch (error) {
          reject(error);
        }
      });

      this.#runCallbacks();
    });
  }

  /**
   * Adds a callback function to be executed when the promise is rejected.
   * @param {function} callback - The callback function to be executed on rejection.
   */
  catch(callback) {
    this.then(undefined, callback);
    // this.#catchCallbacks.push(callback);
    // this.#runCallbacks();
  }

  /**
   * Adds a callback function to be executed when the promise is settled (fulfilled or rejected).
   * @param {function} callback - The callback function to be executed when the promise is settled.
   */
  finally(callback) {
    return this.then(
      (result) => {
        callback();
        return result;
      },
      (result) => {
        callback();
        throw result;
      }
    );
  }
}

module.exports = myPromise;
