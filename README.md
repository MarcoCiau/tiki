# Tiki IoT Platform Backend
Tiki IoT Platform is an app focused on real-time monitoring energy consumption data. 
![Tiki App Screenshot](/tiki_app.png)

## What was your motivation?
This project was born because I was looking to build a project in which I can demonstrate my skills as a backend developer as well as my passion for IoT and renewable energies. 
  
## What challenged you when making this project?
Due to the nature of the project, working with a lot of data in a real time scenario, was a real challenge, however, MongoDB features such as time series were very helpful to overcame this challenge.

## What would you do differently next time?
In my opinion I will take advantage of the benefits of TypeScript and Clean Code principles to make the code more efficient and structured as well.

Another improvements would be optimize the MongoDB Data Modeling considering the needs of the application and the performance of the queries.

Lastly, I would like to implement a Database Caching strategy using Redis in combine with Stack and Hash Table Data Structures in order to improve the performance of the real-time communication with the **Web UI**.

## What learnings have you taken with you into other projects?

For this project I applied my knowledge of TypeScript, REST API, MongoDB-Mongoose, Authentication and Authorization using JWT, Socket.io, and React.js with Hooks. 
For a future version I'm considering to add new features based on Redis and building a CI/CD pipeline.

## What was your process for completing this project?
I managed this project making a [Trello Board](https://trello.com/invite/b/4ePhdifc/ATTIa8d1d320edefe8dd33c39ea096d33d2530CD388A/iot-platform) with Kanban Lean management method.

## Demo
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

