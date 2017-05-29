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

                // If there's just a single "data" argument, resolve with that
                if (args.length === 1) {
                    return resolve(args[0]);
                }

                // Otherwise, resolve with the entire array of data args.
                return resolve(args);
            });

            func.apply(context, callArgs);
        });
    };
};
