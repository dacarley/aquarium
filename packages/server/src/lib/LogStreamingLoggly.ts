import fetch from "node-fetch";

interface Headers {
    [key: string]: string | number;
}

export default class LogStreamingLoggly {
    public static sendToLoggly(message: any): void {
        const payload = JSON.stringify(message);

        const token = "3af27fd8-703f-4245-b975-d75d6aa4d752";
        const url = `https://logs-01.loggly.com/inputs/${token}/tag/aquarium`;
        const headers = {
            "Content-Type": "application/json",
            "Content-Length": payload.length
        };

        this._post(url, payload, headers);
    }

    private static async _post(url: string, body: any, headers: Headers): Promise<void> {
        try {
            await fetch(url, {
                method: "post",
                body: JSON.stringify(body),
                headers: {
                    ...headers,
                    "Content-Type": "application/json"
                }
            });
        } catch (err) {
            console.error("Failed to post to Loggly", err);
        }
    }
};
