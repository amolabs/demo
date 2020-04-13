// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TxBody } from '../components/Tx';
import { TextInput, KeyValueRow, accountLink, blockLink } from '../util';
import { fetchTx } from '../rpc';
import { ec as EC } from 'elliptic';
import sha256 from 'js-sha256';

class Tx extends Component {
	state = {
		txHash: this.props.match.params.txHash,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.txHash !== prevProps.match.params.txHash) {
			const txHash = this.props.match.params.txHash;
			this.setState({ txHash: txHash });
		}
	}

	updateTxHash = (txHash) => {
		this.setState({ txHash: txHash });
		this.props.history.push('/tx/'+txHash);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="TxHash" name="txHash"
					value={this.state.txHash}
					button="Query"
					onSubmit={this.updateTxHash}/>
				<TxDetail txHash={this.state.txHash}/>
			</div>
		);
	}
}

class TxDetail extends Component {
	state = {
		tx: {
			txHash: "loading...",
			index: "loading...",
			height: "loading...",
			sender: "loading...",
			type: "loading...",
			txResult: "loading...",
			pubkey: "loading...",
			sigBytes: "loading...",
		}
	};

	componentDidMount() {
		this.updateTx();
	}

	componentDidUpdate(prevProps) {
		if (this.props.txHash !== prevProps.txHash) {
			this.updateTx();
		}
	}

	updateTx = () => {
		if (this.props.txHash) {
			fetchTx(this.props.txHash,
				result => {
					this.setState({ tx: result });
				}
			);
		} else {
			this.setState({ tx: {} });
		}
	};

	render() {
		var txHashAlt = this.props.txHash;
		if (!txHashAlt) {
			txHashAlt = ( <span>Input transaction hash to inspect &uarr;</span> );
		}
		const tx = this.state.tx;
		const sender = accountLink(tx.sender);
		const position = (
			<span> index {tx.index} in
				a block at height {blockLink(tx.height)}
			</span>
		);
		var txResult = tx.txResult;
		if (tx.txResult && tx.txResult.info) {
			txResult = tx.txResult.info + " (code = "+tx.txResult.code+")";
		}

		// sig
		var valid = false;
		if (typeof tx.pubkey === 'string' && tx.pubkey.length === 130) {
			const sb = JSON.stringify({
				type: tx.type,
				sender: tx.sender,
				payload: tx.payload,
			});
			var ec = new EC('p256');
			var ecKey = ec.keyFromPublic(tx.pubkey, 'hex');
			const hash = sha256(sb);
			valid = ecKey.verify(hash, {
				r: tx.sigBytes.substring(0,64),
				s: tx.sigBytes.substring(64,128),
			});
		}

		// TODO: format
		return (
			<div className="container">
				<KeyValueRow k="TxHash" v={txHashAlt} />
				<KeyValueRow k="Position" v={position} />
				<KeyValueRow k="Sender" v={sender} />
				<hr className="shallow"/>
				<KeyValueRow k="Type" v={tx.type} />
				<TxBody tx={tx} />
				<KeyValueRow k="TxResult" v={txResult} />
				<hr className="shallow"/>
				<KeyValueRow k="Pubkey" v={tx.pubkey} />
				<KeyValueRow k="Signature" v={tx.sigBytes} />
				<KeyValueRow k="Verify" v={valid?"valid":"invalid"} />
			</div>
		);
	}
}

export default withRouter(Tx);
