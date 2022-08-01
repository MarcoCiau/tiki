# Tiki IoT Platform Backend
This is the backend server to the Tiki IoT Platform.

Tiki IoT Platform is an app focused on real-time monitoring and managing IoT devices (temperature sensors, energy meters, etc).
![Tiki App Screenshot](/tiki_app.png)
## Demo Link 
Access my app at [google.com](https://google.com)

To take it for a test run, try these login credentials:
- **Email Address**: testuser3@email.com
- **Password**: qwertyui8

## Architecture 
Tiki IoT Platform v1.0 is based on monolithic architecture where all components are launched in a single Node.js server.
![Tiki IoT Monolithic Architecture](/tiki_iot_arquitecture.png)

## Components
- **IoT Devices**: belongs to all IoT devices ans sensors which send reports data in a interval of time (10 seconds by default)
- **Network Transport**: Tiki IoT provides HTTP transportation for comunication between the Core Services and IoT Devices
- **Core Services**:  are responsible for REST API calls, managing and storing IoT devices data, Websockets subscriptions for real-time telemetry and monitoring IoT devices connectivity state
- **Web UI**: user interface based on React.js which allows to end-users an easy way to monitor and manage IoT devices
## Technology

## Dependencies

## Data Model

## Setup - Deployment
Please follow the instructions [here](/Developer.md) to setup the project for development and to know how to deploy it. 

## API V1 Documentation
https://documenter.getpostman.com/view/5095898/UyxeoTvn

