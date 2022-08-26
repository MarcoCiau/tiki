# Tiki IoT Platform Backend
This is the backend server to the Tiki IoT Platform.

Tiki IoT Platform is an app focused on real-time monitoring and managing IoT devices (aingle and three phase energy meters).
![Tiki App Screenshot](/tiki_app.png)
## Demo Link 
Access my app [here](https://tiki-iot.herokuapp.com/).

To take it for a test run, try these login credentials:
- **Email Address**: testuser3@email.com
- **Password**: qwertyui8

## Architecture 
Tiki IoT Platform v1.0 is based on monolithic architecture where all components are launched in a single Node.js server.

![Tiki IoT Monolithic Architecture](/tiki_iot_arquitecture.png)
### Components
- **IoT Devices**: belongs to all IoT devices ans sensors which send reports data in a interval of time (10 seconds by default).
- **Network Transport**: Tiki IoT provides HTTP transportation for comunication between the Core Services and IoT Devices.
- **Core Services**:  are responsible for REST API calls, managing and storing IoT devices data, Websockets subscriptions for real-time telemetry and monitoring IoT devices connectivity state.
- **Web UI**: user interface based on React.js which allows to end-users an easy way to monitor and manage IoT devices. For more details of the Web UI Client, visit the following [repository](https://github.com/MarcoCiau/tiki_client).
## Technology

- [Express.js](https://expressjs.com/): Exposes REST API end-points, a custom error handler is implemented and multiple middlwares for security, data validation and sanatization, authentication and authorization are implemented.
- [TypeScript](https://www.typescriptlang.org/): used to represent IoT devices and sensors entities using types and interfaces in order to make the development process easier.
- [MongoDB](https://www.mongodb.com/): data model definition and persistence in a noSQL database. MongoDB time series collections used for efficiently querying device's data.
- [Mongoose ODM](https://mongoosejs.com/):  provided object-document mapping for easy MongoDB data retreival and manipulation.
- [Socket.io](https://socket.io/): used to establish a real-time telemetry with the **Web UI**.
## Dependencies
- [express-validator](https://www.npmjs.com/package/express-validator): set of express.js middlewares used for validate and sanatize REST API end-point's data.  
- [bcrypt](https://www.npmjs.com/package/bcrypt): password hashing algorithm used to securely save and verify users password.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) : for user authentication and authorization using JWT.

## Security Dependencies
- [helmet](https://helmetjs.github.io/): for secure Express.js server app by properly settings HTTP Headers.  
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit): used to limit repeated requests (brute force attacks) to public APIs(register/login).
- [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize) : used to prevent MongoDB Injection Attacks.

## Setup - Deployment
Please follow the instructions [here](/Developer.md) to setup the project for development and to know how to deploy it. 

## API V1 Documentation
https://documenter.getpostman.com/view/5095898/VUr1FXZm

