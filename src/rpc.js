// vim: set noexpandtab ts=2 sw=2 :
import axios from 'axios';
import sha256 from 'js-sha256';

//const BCNODE = 'localhost:26657';
//const BCNODE = '192.168.50.88:26657';
const BCNODE = '139.162.116.176:26657'; // amo-tokyo
//const BCNODE = '172.105.64.192:26657'; // amo-frank2
//const BCNODE = 'vm7:26657'; // stress test vm1
const wsURL = `ws://${BCNODE}/websocket`;
const httpURL = `http://${BCNODE}`;

const STORAGE = 'http://139.162.111.178:5000'; // amo-sto

let ws;

/* web socket based new block subscription */
export function startSubscribe(onNewBlock, onError) {
	ws = new WebSocket(wsURL);

	// register callbacks for web socket
	ws.onopen = () => {
		ws.send(
			JSON.stringify({
				jsonrpc: '2.0',
				method: 'subscribe',
				id: 'newBlock',
				params: {
					query: "tm.event='NewBlock'",
				}
			})
		);
	};
	ws.onmessage = e => {
		const message = JSON.parse(e.data);
		if (message.id === 'newBlock#event') {
			const blockHeader = message.result.data.value.block.header;
			onNewBlock(blockHeader.height);
		}
	};
	ws.onerror = onError;
}

//////// block query rpc

function formatBlockHeader(blk) {
	return {
		chain: blk.header.chain_id,
		hash: blk.block_id.hash,
		height: blk.header.height,
		proposer: blk.header.proposer_address,
		numTx: blk.header.num_txs,
		timestamp: blk.header.time,
	};
}

export function fetchLastBlock(callback) {
	axios.get(`${httpURL}/block`).then(res => {
		callback(formatBlockHeader(res.data.result.block_meta));
	});
}

export function fetchLastHeight(callback) {
	fetchLastBlock(result => {
		callback(parseInt(result.height));
	});
}

function formatBlock(blk) {
	if (!blk.data.txs) {
		blk.data.txs = [];
	}
	return {
		chain: blk.header.chain_id,
		height: blk.header.height,
		proposer: blk.header.proposer_address,
		numTx: blk.header.num_txs,
		timestamp: blk.header.time,
		txs: blk.data.txs.map(a => {
			var tx = JSON.parse(atob(a));
			tx.hash = sha256(atob(a));
			return tx;
		}),
	};
}

export function fetchBlock(height, callback) {
	axios.get(`${httpURL}/block?height=${height}`).then(
		res => {
			if ('error' in res.data) {
				callback({});
			} else {
				callback(formatBlock(res.data.result.block));
			}
		}
	);
}

export function fetchBlockHeaders(maxHeight, count, callback) {
	const minHeight = Math.max(1, maxHeight - count + 1);
	axios
		.get(
			`${httpURL}/blockchain?maxHeight=${maxHeight}&minHeight=${minHeight}`
		)
		.then(res => {
			callback(
				res.data.result.block_metas.map(formatBlockHeader)
			);
		});
}

export function fetchRecentBlockHeaders(callback) {
	// will retrieve most recent 20 block headers
	axios.get(`${httpURL}/blockchain`).then(res => {
		callback(
			res.data.result.block_metas.map(formatBlockHeader)
		);
	});
}

//////// tx query rpc

function formatTx(tmTx) {
	return {
		hash: tmTx.hash,
		height: tmTx.height,
		index: tmTx.index,
		txResult: tmTx.tx_result,
		type: tmTx.tx.type,
		sender: tmTx.tx.sender,
		payload: tmTx.tx.payload,
		pubkey: tmTx.tx.signature.pubkey,
		sigBytes: tmTx.tx.signature.sig_bytes,
	};
}

// TODO: signature and pubkey
export function fetchTx(hash, callback) {
	axios.get(`${httpURL}/tx?hash=0x${hash}`).then(
		res => {
			if ('error' in res.data) {
				callback({});
			} else {
				var tmTx = res.data.result;
				tmTx.tx = JSON.parse(atob(tmTx.tx));
				callback(formatTx(tmTx));
			}
		}
	);
}

export function fetchRecentTxs(callback) {
	fetchRecentBlockHeaders(blocks => {
		const promises = blocks
			.filter(b => b.numTx > 0)
			.map(b => axios.get(`${httpURL}/block?height=${b.height}`));

		Promise.all(promises).then(responses => {
			callback(
				[]
				.concat(
					...responses.map(res => res.data.result.block.data.txs)
				)
				.map(tx => {
					return {
						hash: sha256(atob(tx)),
						...JSON.parse(atob(tx)),
					};
				})
			);
		});
	});
}

// TODO: pagination
export function fetchTxsByAccount(address, callback) {
	axios.get(`${httpURL}/tx_search?query="tx.sender='${address}'"`).then(
		res => {
			if (!res.data.error && 'txs' in res.data.result) {
				callback(res.data.result.txs.map(tx => {
					tx.tx = JSON.parse(atob(tx.tx))
					return formatTx(tx);
				}));
			} else {
				callback([]);
			}
		}
	);
}

// TODO: pagination
export function fetchTxsByParcel(parcel, callback) {
	axios.get(`${httpURL}/tx_search?query="parcel.id='${parcel}'"`).then(
		res => {
			if (!res.data.error && 'txs' in res.data.result) {
				callback(res.data.result.txs.map(tx => {
					tx.tx = JSON.parse(atob(tx.tx))
					return formatTx(tx);
				}));
			} else {
				callback([]);
			}
		}
	);
}

function matchAddress(item, address) {
	return item.address.toUpperCase() === address.toUpperCase();
}

export function fetchValidator(address, callback) {
	axios.get(`${httpURL}/validators`).then(
		res => {
			var hit = res.data.result.validators.find((val) => {
				return matchAddress(val, address);
			});
			if (hit) {
				var buf = Buffer.from(hit.pub_key.value, 'base64');
				hit.pubkey = buf.toString('hex');
				callback(hit);
			} else {
				callback(null);
			}
		},
		err => { callback(null); }
	);
}

//////// abci query rpc

export function abciQuery(type, params, onSuccess, onError) {
	let data;
	data = JSON.stringify(params).replace(/"/g, '\\"');

	axios
		.get(`${httpURL}/abci_query?path="/${type}"&data="${data}"`)
		.then(res => {
			if (res.data.error) return onError(res.data.error);
			if (res.data.result.response.code)
				return onError(res.data.result.response.log);
			return onSuccess(res.data.result.response.value);
		});
}

export function fetchBalance(address, callback) {
	abciQuery('balance', address,
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(0); }
	);
}

export function fetchStake(address, callback) {
	abciQuery('stake', address,
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(null); }
	);
}

export function fetchStakeHolder(address, callback) {
	abciQuery('validator', address,
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(0); }
	);
}

export function fetchDelegate(address, callback) {
	abciQuery('delegate', address,
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(null); }
	);
}

export function fetchParcel(id, callback) {
	abciQuery('parcel', id,
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(null); }
	);
}

export function fetchRequest(buyer, target, callback) {
	abciQuery('request', {buyer: buyer, target: target},
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(null); },
	);
}

export function fetchUsage(buyer, target, callback) {
	abciQuery('usage', {buyer: buyer, target: target},
		res => { callback(JSON.parse(atob(res))); },
		err => { callback(null); },
	);
}

//////// send tx rpc

function sendTx(tx, ecKey, callback, errCallback) {
	axios.get(`${httpURL}/status`)
		.then(res => {
			tx.fee = "0";
			tx.last_height = `${res.data.result.sync_info.latest_block_height}`;
			var rawTx = JSON.stringify(signTx(tx, ecKey));
			sendRawTx(rawTx, callback, errCallback);
		});
}

function sendRawTx(tx, callback, errCallback) {
	var escaped = tx.replace(/"/g, '\\"');
	axios.post(`${httpURL}/broadcast_tx_commit?tx="${escaped}"`)
		.then(res => {
			if (res.data.error) {
				// tendermint error
				errCallback(res.data.error);
			} else if (res.data.result.check_tx.code > 0) {
				// abci check_tx error
				console.log('check_tx error:', res.data.result.check_tx.code);
				console.log(res.data.result.check_tx.info);
				errCallback({
					// TODO: human readable error reason
					message: 'abci error code '+res.data.result.check_tx.code,
					data: null,
				});
			} else if (res.data.result.deliver_tx.code > 0) {
				// abci deliver_tx error
				console.log('deliver_tx error:', res.data.result.deliver_tx.code);
				console.log(res.data.result.deliver_tx.info);
				errCallback({
					// TODO: human readable error reason
					message: 'abci error code '+res.data.result.deliver_tx.code,
					data: null,
				});
			} else {
				callback(res.data);
			}
		});
}

function sign(sb, key) {
	const sig = key.sign(sha256(sb));
	const r = ('0000'+sig.r.toString('hex')).slice(-64); // fail-safe
	const s = ('0000'+sig.s.toString('hex')).slice(-64); // fail-safe
	return r+s;
}

function signTx(tx, key) {
	// We do some weired thing to sign a tx, since the order of the fields
	// matters.
	var txToSign = {
		type: tx.type,
		sender: tx.sender,
		fee: tx.fee,
		last_height: tx.last_height,
		payload: tx.payload,
	};
	const sig = sign(JSON.stringify(txToSign), key);
	txToSign.signature = {
		pubkey: key.getPublic().encode('hex'),
		sig_bytes: sig,
	};

	return txToSign;
}

export function transfer(recp, amount, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'transfer',
		sender: sender.address.toUpperCase(),
		payload: {
			to: recp.toUpperCase(),
			amount: amount,
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function delegate(delegatee, amount, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'delegate',
		sender: sender.address.toUpperCase(),
		payload: {
			to: delegatee.toUpperCase(),
			amount: amount,
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function retract(amount, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'retract',
		sender: sender.address.toUpperCase(),
		payload: {
			amount: amount,
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function registerParcel(parcel, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'register',
		sender: sender.address.toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
			custody: parcel.custody.toString('hex').toUpperCase(),
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function discardParcel(parcel, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'discard',
		sender: sender.address.toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function requestParcel(parcel, payment, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'request',
		sender: sender.address.toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
			payment: payment,
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function cancelRequest(parcel, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'cancel',
		sender: sender.address.toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function grantParcel(parcel, grantee, custody, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'grant',
		sender: sender.address.toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
			grantee: grantee.address.toUpperCase(),
			custody: custody.toString('hex').toUpperCase(),
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

export function revokeGrant(parcel, grantee, sender, callback, errCallback) {
	if (!sender || !sender.ecKey) {
		errCallback({message: 'no sender key', data: 'sender.ecKey is null'});
		return;
	}

	var tx = {
		type: 'revoke',
		sender: sender.address.toUpperCase(),
		payload: {
			target: parcel.id.toUpperCase(),
			grantee: grantee.address.toUpperCase(),
		},
	};

	sendTx(tx, sender.ecKey, callback, errCallback);
}

//////// amo-storage rpc

export function uploadParcel(owner, content, cb) {
	axios.post(`${STORAGE}/api/v1/auth`, JSON.stringify(
		{
			user: owner.address,
			operation: {
				name: 'upload',
				hash: sha256(content).toString('hex'),
			}
		}),
		{headers: {'content-type': 'application/json'}}
	)
		.then(res1 => {
			var token = res1.data.token;
			axios.post(`${STORAGE}/api/v1/parcels`, JSON.stringify(
				{
					owner: owner.address,
					metadata: {
						owner: owner.address,
					},
					data: content.toString('hex'),
				}),
				{headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': token,
					'X-Public-Key': owner.ecKey.getPublic().encode('hex'),
					'X-Signature': sign(token, owner.ecKey),
				}}
			)
				.then(res2 => {
					if ('error' in res2.data) {
						cb(res2.data.error, null);
					} else {
						cb(null, res2.data.id);
					}
				})
				.catch(err => {
					cb(err, null);
				});
		})
		.catch(err => {
			console.log('err =', err);
			cb(err, null);
		});
}

export function downloadParcel(buyer, id, cb) {
	axios.post(`${STORAGE}/api/v1/auth`, JSON.stringify(
		{
			user: buyer.address,
			operation: {
				name: 'download',
				id: id
			}
		}),
		{headers: {'content-type': 'application/json'}}
	)
		.then(res1 => {
			var token = res1.data.token;
			axios.get(`${STORAGE}/api/v1/parcels/${id}`,
				{headers: {
					'Content-Type': 'application/json',
					'X-Auth-Token': token,
					'X-Public-Key': buyer.ecKey.getPublic().encode('hex'),
					'X-Signature': sign(token, buyer.ecKey),
				}})
				.then(res2 => {
					if ('error' in res2.data) {
						cb(res2.data.error, null);
					} else {
						cb(null, res2.data.data);
					}
				})
				.catch(err => {
					cb(err, null);
				});
		})
		.catch(err => {
		});
}

export function inspectParcel(id, cb) {
	// No auth
	axios.get(`${STORAGE}/api/v1/parcels/${id}?key=metadata`)
		.then(res2 => {
			if ('error' in res2.data) {
				cb(res2.data.error, null);
			} else {
				console.log('res2.data =', res2.data.metadata);
				cb(null, res2.data.metadata);
			}
		})
		.catch(err => {
			cb(err, null);
		});
}

export function removeParcel(id, cb) {
}

