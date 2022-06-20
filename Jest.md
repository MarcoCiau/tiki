# Install dependencies
For unit testing, we'll use **jest** and **supertest** tool.

**supertest**: for HTTP testing
``` bash
npm install jest supertest ts-jest ts-node --save-dev
```

- Install typescript @types

**supertest**: for HTTP testing
``` bash
npm install @types/jest @types/supertest --save-dev
```

# Setup config.json
Especify test scripts folder
``` js
{
  "scripts": {
    "test": "jest ./dist/__tests__/"
  }
}
```

# Generate configuration file

``` bash
jest --init
```