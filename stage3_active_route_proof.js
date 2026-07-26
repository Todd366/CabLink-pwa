
const http = require("http");

const BASE = "http://127.0.0.1:3000";

function request(method, path, body = null) {

    return new Promise((resolve, reject) => {

        const data =
            body
                ? JSON.stringify(body)
                : null;

        const req = http.request(
            BASE + path,
            {
                method,

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(data
                        ? {
                            "Content-Length":
                                Buffer.byteLength(data)
                        }
                        : {})
                }
            },

            res => {

                let raw = "";

                res.on(
                    "data",
                    chunk => {
                        raw += chunk;
                    }
                );

                res.on(
                    "end",
                    () => {

                        let json = null;

                        try {
                            json = JSON.parse(raw);
                        } catch (_) {}

                        resolve({
                            status:
                                res.statusCode,

                            body:
                                json,

                            raw
                        });

                    }
                );

            }
        );

        req.on(
            "error",
            reject
        );

        if (data) {
            req.write(data);
        }

        req.end();

    });

}

async function main() {

    console.log(
        "\n🚕 CABLINK ACTIVE ROUTE PROOF"
    );

    console.log(
        "GET /api/rides"
    );

    const response =
        await request(
            "GET",
            "/api/rides"
        );

    console.log(
        "\nHTTP STATUS:",
        response.status
    );

    console.log(
        "RAW RESPONSE:"
    );

    console.log(
        JSON.stringify(
            response.body,
            null,
            2
        )
    );

    const canonical =
        response.status === 200 &&
        response.body &&
        response.body.success === true &&
        typeof response.body.count === "number" &&
        Array.isArray(
            response.body.rides
        );

    if (canonical) {

        console.log(
            "\n✅ ACTIVE PORT 3000 IS USING THE CANONICAL RIDE API"
        );

        console.log(
            "✅ success=true"
        );

        console.log(
            "✅ count present"
        );

        console.log(
            "✅ rides array present"
        );

        process.exit(0);

    } else {

        console.log(
            "\n❌ ACTIVE PORT 3000 IS STILL NOT USING THE CANONICAL RESPONSE"
        );

        console.log(
            "\nExpected:"
        );

        console.log(
            JSON.stringify(
                {
                    success: true,
                    count: 0,
                    rides: []
                },
                null,
                2
            )
        );

        process.exit(1);

    }

}

main().catch(
    error => {

        console.error(
            "\n❌ ROUTE PROOF FAILED:"
        );

        console.error(
            error.message
        );

        process.exit(1);

    }
);
