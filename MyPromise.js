const PENDING = "pending";
const RESOLVED = "resolved";
const REJECTED = "rejected";
class MyPromise {
	status = PENDING;
	successCallback = [];
	failCallback = [];
	value = null;
	constructor(fn) {
		function resolve(value) {
			if (this.status === PENDING) {
				this.status = RESOLVED;
				this.value = value;
				this.successCallback.map(cb => cb(this.value));
			}
		}
		function reject(value) {
			if (this.status === PENDING) {
				this.status = REJECTED;
				this.value = value;
				this.failCallback.map(cb => cb(this.value));
			}
		}
		try {
			fn(resolve.bind(this), reject.bind(this));
		} catch (error) {
			this.reject(error);
		}
	}
	then(onResolved, onRejected) {
		onResolved = typeof onResolved === "function" ? onResolved : e => e;
		onRejected = typeof onRejected === "function" ? onRejected : e => e;
		if (this.status === PENDING) {
			this.successCallback.push(onResolved);
			this.failCallback.push(onRejected);
		}
		if (this.status === RESOLVED) {
			onResolved(this.value);
		}
		if (this.status === REJECTED) {
			onRejected(this.value);
		}
	}
	static resolve(value) {
		return new MyPromise(resolve => resolve(value));
	}
	static reject(error) {
		return new MyPromise((resolve, reject) => {
			reject(error);
		});
	}
	static all(promiseArray) {
		return new MyPromise((resolve, reject) => {
			let resolvedArr = [];
			let len = promiseArray.length;
			function checkAll() {
				if (resolvedArr.length === len) {
					resolve(resolvedArr);
				}
			}
			try {
				for (let x of promiseArray) {
					x.then(
						data => {
							resolvedArr.push(data);
							checkAll();
						},
						error => reject(error)
					);
				}
			} catch (error) {
				reject(error);
			}
		});
	}
	static race(promiseArray) {
		return new MyPromise((resolve, reject) => {
			try {
				for (let x of promiseArray) {
					x.then(
						data => resolve(data),
						error => reject(error)
					);
				}
			} catch (error) {
				reject(error);
			}
		});
	}
}

let pro = () => {
	return new MyPromise(resolve => {
		setTimeout(() => {
			resolve(11);
		}, 1000);
	});
};
let pro2 = () => {
	return new MyPromise(resolve => {
		setTimeout(() => {
			resolve(222);
		}, 2000);
	});
};

MyPromise.all([pro(), pro2()]).then(res => {
	console.log(res);
});
