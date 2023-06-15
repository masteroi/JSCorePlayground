const STATE = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

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

  then(thenCallback, catchCallback) {
    return new myPromise((resolve, reject) => {
      if (thenCallback != null) this.#thenCallbacks.push(thenCallback);
      if (catchCallback != null) this.#catchCallbacks.push(catchCallback);

      this.#runCallbacks();
    });
  }

  catch(callback) {
    this.then(undefined, callback);
    // this.#catchCallbacks.push(callback);
    // this.#runCallbacks();
  }

  finally(callback) {}
}

module.exports = myPromise;
