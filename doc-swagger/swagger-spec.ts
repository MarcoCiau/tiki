import swaggerJsDoc from 'swagger-jsdoc';
const swaggerDocument = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Tiki IoT REST API",
            version: "1.0.0",
            description:
                "Tiki IoT Platform REST API application based on Node.js,Express, TypeScript and MongoDB and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
        },
        servers: [
            {
                url: "http://localhost:4000/api/v1/",
            },
        ],
    },
    apis: ["**/auth.ts", "**/device.ts", "**/reads.ts"],
};

const swaggerDocumentSetup = swaggerJsDoc(swaggerDocument);
export default swaggerDocumentSetup;