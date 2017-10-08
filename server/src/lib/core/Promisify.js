// @providesModule AQ-Promisify

export default (func, context) => {
    if (typeof func !== "function") {
        throw new TypeError("First parameter is not a function");
    }

    return (...callArgs) => {
        return new Promise((resolve, reject) => {
            callArgs.push((err, ...args) => {
                if (err) {
                    return reject(err);
                }

                resolve(...args);
            });

            try {
                func.apply(context, callArgs);
            } catch (err) {
                reject(err);
            }
        });
    };
};
