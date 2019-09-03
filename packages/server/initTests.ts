/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-namespace */

import _ from "lodash";
import chai from "chai";

declare global {
    export namespace Chai {
        interface Assertion {
            throwAsync(expected: any): Assertion;
        }
    }
}

export default (): void => {
    chai.use((chai, utils) => {
        chai.should();
        chai.use(require("sinon-chai"));
        chai.use(require("chai-subset"));
        chai.use(require("chai-string"));

        const {
            Assertion,
            AssertionError
        } = chai;

        utils.addMethod(
            Assertion.prototype,
            "throwAsync",
            function throwAsync(this: any, expected: any = Error) {
                const fn = this._obj;

                return new Promise(async (resolve, reject) => {
                    try {
                        await fn();
                    } catch (err) {
                        switch (true) {
                            case _.isString(expected):
                                if (err.message !== expected) {
                                    return reject(
                                        new AssertionError(
                                            `Expected "${expected}" to be thrown, but "${err.message}" was thrown instead.`,
                                            {
                                                actual: err,
                                                expected,
                                                showDiff: true
                                            }
                                        )
                                    );
                                }
                                break;

                            default:
                                if (!(typeof (err) === expected)) {
                                    return reject(
                                        new AssertionError(
                                            `Expected ${expected.name} to be thrown, but ${err.constructor.name} was thrown instead.`,
                                            {
                                                actual: err,
                                                expected,
                                                showDiff: true
                                            }
                                        )
                                    );
                                }
                                break;
                        }

                        return resolve();
                    }

                    if (_.isString(expected)) {
                        return reject(new AssertionError(`Expected "${expected}" to be thrown.`));
                    }

                    reject(new AssertionError(`Expected ${expected.name} to be thrown.`));
                });
            }
        );
    });
};
