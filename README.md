## AMO Block Explorer
Block explorer for AMO
- Subscribe block events including new block event and new tx event via websocket JSON RPC
- Show block information (hash, height, number of tx, timestamp, parent hash, miner)
- Show tx information (hash, from, to, timestamp, amount, block hash)

### Quick-start
- Install [node.js](https://nodejs.org/en/) (recommend LTS)
- Install dependencies by running:
```bash
npm install --no-optional
```
- Run the app by running:
```bash
npm start
```
- A daemon will start on localhost at port 3000.
- In desktop-class OSes, app will automatically launch a default web browser window.

#### Production build
```bash
npm run build
```
