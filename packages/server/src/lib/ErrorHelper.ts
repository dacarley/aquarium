import _ from "lodash";

export default class {
    public static toJSON(err: any): any {
        const plainObject = {} as any;

        Object.getOwnPropertyNames(err).forEach(key => {
            const value = err[key];
            switch (key) {
                case "stack":
                    plainObject[key] = this._processStack(value);
                    break;

                default:
                    plainObject[key] = value;
                    break;
            }
        });

        return plainObject;
    }

    private static _processStack(rawStack: string): string[] {
        if (!_.isString(rawStack)) {
            return rawStack;
        }

        const stack = rawStack.split("\n");

        return stack.map(entry => {
            return entry
                .replace(/.*\/CodePush\/main\.jsbundle/, "main.jsbundle")
                .replace(/.*\/CodePush\/index\.android\.bundle/, "index.android.bundle");
        });
    }
};
