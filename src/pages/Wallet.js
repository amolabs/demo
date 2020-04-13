// vim: set noexpandtab ts=2 sw=2 :
import React, { useState, useEffect } from 'react';
import { ec as EC } from 'elliptic';
import sha256 from 'js-sha256';
import { RIEInput, RIENumber } from 'riek';
import { MdAutorenew } from 'react-icons/md';
import { useCookies } from 'react-cookie';
import * as util from '../util';
import * as rpc from '../rpc';

// for faucet ask
import axios from 'axios';

const faucetServer = '139.162.116.176:20000';

function askForCoin(address) {
	const reqBody = JSON.stringify({ recp: address });
	axios
		.post('http://'+faucetServer, reqBody)
		.then(res => {
			console.log('res =', res);
		})
		.catch(err => {
			if (err.response)
				console.log('response with error:', err.response);
			else if (err.request)
				console.log('error in request:', err.request);
			else
				console.log('error =', err.message);
		});
}

function generateAccount(seed) {
	var ec = new EC('p256');
	const ecKey = ec.keyFromPrivate(sha256(seed));
	const pub= ecKey.getPublic().encode();
	const address = sha256(pub).slice(0,40);
	return { seed: seed, address: address, ecKey: ecKey };
}

function doTransfer(recp, amount, ecKey, cb) {
	if (recp && amount && ecKey) {
		var sender = {
			address: util.pub2address(ecKey.getPublic().encode()),
			ecKey: ecKey
		};
		rpc.transfer(
			recp, amount, sender,
			(res) => {cb();},
			(err) => {cb();}
		);
	}
}

function doDelegate(delegatee, amount, ecKey, cb) {
	if (delegatee && amount && ecKey) {
		var sender = {
			address: util.pub2address(ecKey.getPublic().encode()),
			ecKey: ecKey
		};
		rpc.delegate(
			delegatee, amount, sender,
			(res) => {cb();},
			(err) => {cb();},
		);
	}
}

function doRetract(amount, ecKey, cb) {
	if (amount && ecKey) {
		var sender = {
			address: util.pub2address(ecKey.getPublic().encode()),
			ecKey: ecKey
		};
		rpc.retract(
			amount, sender,
			(res) => {cb();},
			(err) => {cb();},
		);
	}
}

// TODO: validation for all HEX input boxes

function Wallet() {
	const [ecKey, setEcKey] = useState(null);
	const [remoteUpdate, setReload] = useState(false);
	return (
		<div className="container">
			<div className="container">
				Simple wallet demo.
			</div>
			<div className="container">
				Refresh
				<button
					type="button"
					onClick={()=>{setReload(!remoteUpdate);}}
					style={{cursor:"pointer",border:"0px"}}
				>
					<MdAutorenew/>
				</button>
				(Don't reload the page. Click the refresh icon.)
			</div>
			<WalletAccount
				remoteUpdate={remoteUpdate}
				doReload={()=>{setReload(!remoteUpdate);}}
				onNewEcKey={setEcKey}
			/>
			<Transfer
				remoteUpdate={remoteUpdate}
				doReload={()=>{setReload(!remoteUpdate);}}
				ecKey={ecKey}
			/>
			<Delegate
				remoteUpdate={remoteUpdate}
				doReload={()=>{setReload(!remoteUpdate);}}
				ecKey={ecKey}
			/>
		</div>
	);
}

function WalletAccount(props) {
	const [cookies, setCookie] = useCookies([ 'seedwallet' ]);
	var seed = cookies.seedwallet;
	useEffect(() => {
		if (seed) {
			var account = generateAccount(seed);
			setAddress(account.address);
			setEcKey(account.ecKey);
		} else {
			setAddress(null);
			setEcKey(null);
		}
	}, [seed]);
	const [ecKey, setEcKey] = useState(null);
	useEffect(() => {
		props.onNewEcKey(ecKey);
	}, [ecKey, props]);
	const [address, setAddress] = useState(null);
	const [balance, setBalance] = useState(0);
	useEffect(() => {
		if (address) {
			setBalance('reloading...');
			rpc.fetchBalance(address, (balance) => {
				setBalance(balance);
			});
		}
	}, [address, props.remoteUpdate]);

	// if the balance is less than one AMO
	var faucetLink;
	if (address && balance === '0') {
		faucetLink = (
			<div className="container">
				<button onClick={()=>{askForCoin(address);}}>
					Ask for coin
				</button>
			</div>
		);
	} else {
		faucetLink = (<div className="container"></div>);
	}

	return (
		<div className="container round-box">
			<b>Wallet account</b>
			<div className="container">
				Seed:&nbsp;
				<RIEInput
					value={seed?seed:'input seed string and press enter'}
					propName="seed"
					change={(prop) => {
						setCookie('seedwallet', prop.seed);
					}}
					className="rie-inline"
					defaultProps={
						seed?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
			<div className="container">
				Address: {
					address?
						util.accountLink(address):
						(<span style={{fontStyle:"italic",color:"gray"}}>not generated yet</span>)
				}
			</div>
			<div className="container">
				Balance: {util.coinVerbose(balance)}
			</div>
			{faucetLink}
		</div>
	);
}

function Transfer(props) {
	const [recp, setRecp] = useState(null);
	const [balance, setBalance] = useState(0);
	const [amount, setAmount] = useState(0);
	const [processing, setProcessing] = useState(false);
	useEffect(() => {
		if (recp) {
			setBalance('reloading...');
			rpc.fetchBalance(recp, (balance) => {
				setBalance(balance);
			});
		}
	}, [recp, props.remoteUpdate]);

	return (
		<div className="container round-box">
			<b>Transfer</b>
			<div className="container">
				Recipient Address:&nbsp;
				<RIEInput
					value={recp?recp:'input address and press enter'}
					propName="recp"
					change={(prop) => {
						setRecp(prop.recp);
					}}
					className="rie-inline"
					defaultProps={
						recp?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
			<div className="container">
				Recipient Balance: {util.coinVerbose(balance)}
			</div>
			<div className="container">
				Transfer Amount:&nbsp;
				<RIENumber
					value={amount?amount:'input number and press enter'}
					propName="amount"
					change={(prop) => {setAmount(prop.amount);}}
					className="rie-inline"
					defaultProps={
						amount?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
			<div className="container">
				<button
					type="button"
					onClick={() => {
						setProcessing(true);
						doTransfer(recp, amount, props.ecKey, () => {
							props.doReload();
							setProcessing(false);
						});
					}}
					disabled={!recp||!amount||!props.ecKey||processing}
				>
					Transfer
				</button>
			</div>
		</div>
	);
}

/*
function Stake(props) {
	useEffect(() => {
		if (props.ecKey) {
			var address = util.pub2address(props.ecKey.getPublic().encode());
			setValidator('reloading...');
			setAmount('reloading...');
			rpc.fetchStake(address, (stake) => {
				if (stake) {
					setValidator(stake.validator);
					setAmount(stake.amount);
				} else {
					setValidator('none');
					setAmount(0);
				}
			});
		}
	}, [props.ecKey, props.remoteUpdate]);
	const [validator, setValidator] = useState(null);
	const [amount, setAmount] = useState(0);
	//const [newVal, setNewVal] = useState(null);
	//const [newAmount, setNewAmount] = useState(0);

	return (
		<div className="container round-box">
			<b>Stake</b>
			<div className="container">
				Validator Pubkey: {validator}
			</div>
			<div className="container">
				Amount: {amount}
			</div>
		</div>
	);
}
*/

function Delegate(props) {
	const [address, setAddress] = useState(null);
	const [delegatee, setDelegatee] = useState(null);
	const [amount, setAmount] = useState(0);
	const [toDelegate, setToDelegate] = useState(null);
	const [toAmount, setToAmount] = useState(0);
	const [retractAmount, setRetractAmount] = useState(0);
	const [processing, setProcessing] = useState(false);
	useEffect(() => {
		if (props.ecKey) {
			setAddress(util.pub2address(props.ecKey.getPublic().encode()));
		} else {
			setAddress(null);
		}
	}, [props.ecKey]);
	useEffect(() => {
		if (address) {
			setDelegatee('reloading...');
			setAmount('reloading...');
			rpc.fetchDelegate(address, (d) => {
				if (d) {
					setDelegatee(d.delegatee);
					setAmount(d.amount);
				} else {
					setDelegatee(null);
					setAmount(0);
				}
			});
		}
	}, [address, props.remoteUpdate]);
	useEffect(() => {
		setToDelegate(delegatee);
	}, [delegatee]);

	var inputDelegatee;
	if (delegatee) {
		inputDelegatee = toDelegate;
	} else {
		inputDelegatee = (
			<RIEInput
				value={toDelegate?toDelegate:'input stakeholder addresss and press enter'}
				propName="todelegate"
				change={(prop) => { setToDelegate(prop.todelegate); }}
				className="rie-inline"
				defaultProps={
					toDelegate?{}:{style:{fontStyle:"italic",color:"gray"}}
				}
			/>
		);
	}

	return (
		<div className="container round-box">
			<b>Delegate</b>
			<div className="container">
				Delegator (myself): {address?address:'none'}
			</div>
			<div className="container">
				Delegatee (stakeholder): {delegatee?util.accountLink(delegatee):'none'}
			</div>
			<div className="container">
				Amount: {amount?util.coinVerbose(amount):0}
			</div>
			<hr className="shallow"/>
			<div className="container">
				Add Delegate: {inputDelegatee}
			</div>
			<div className="container">
				Add Amount:&nbsp;
				<RIENumber
					value={toAmount?toAmount:'input number and press enter'}
					propName="amount"
					change={(prop) => {setToAmount(prop.amount);}}
					className="rie-inline"
					defaultProps={
						toAmount?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
			<div className="container">
				<button
					type="button"
					onClick={() => {
						setProcessing(true);
						doDelegate(toDelegate, toAmount, props.ecKey, () => {
							props.doReload();
							setProcessing(false);
							setToAmount(0);
						});
					}}
					disabled={!toDelegate||!toAmount||!props.ecKey||processing}
				>
					Delegate
				</button>
			</div>
			<hr className="shallow"/>
			<div className="container">
				Retract Amount:&nbsp;
				<RIENumber
					value={retractAmount?retractAmount:'input number and press enter'}
					propName="amount"
					change={(prop) => {setRetractAmount(prop.amount);}}
					className="rie-inline"
					defaultProps={
						retractAmount?{}:{style:{fontStyle:"italic",color:"gray"}}
					}
				/>
			</div>
			<div className="container">
				<button
					type="button"
					onClick={() => {
						setProcessing(true);
						doRetract(retractAmount, props.ecKey, () => {
							props.doReload();
							setProcessing(false);
							setRetractAmount(0);
						});
					}}
					disabled={!retractAmount||!props.ecKey||processing}
				>
					Retract
				</button>
			</div>
		</div>
	);
}

export default Wallet;
