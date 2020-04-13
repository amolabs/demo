// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TxBriefList } from '../components/Tx';
import { TextInput, KeyValueRow, coinVerbose, pub2address, validatorLink, accountLink } from '../util';
import { fetchBalance, fetchStake, fetchDelegate, fetchTxsByAccount } from '../rpc';

class Account extends Component {
	state = {
		address: this.props.match.params.address,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.address !== prevProps.match.params.address) {
			const address = this.props.match.params.address;
			this.setState({ address: address });
		}
	}

	updateAddress = (address) => {
		this.setState({ address: address });
		this.props.history.push('/account/'+address);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Address" name="address"
					value={this.state.address}
					button="Query"
					onSubmit={this.updateAddress}/>
				<AccountDetail address={this.state.address}/>
			</div>
		);
	}
}

const AccountDetail = ({address}) => {
	// XXX there's nothing useful to manage as 'state' here
	var addressAlt = address;
	if (!address) {
		addressAlt = ( <span>Input account address to inspect &uarr;</span> );
	}
	return (
		<div className="container">
			<KeyValueRow k="Address" v={addressAlt} />
			<Balance address={address}/>
			<Stake address={address}/>
			<Delegate address={address}/>
			<AccountTxs address={address}/>
		</div>
	);
};

class Balance extends Component {
	state = { balance: "loading..." };

	componentDidMount() {
		this.updateBalance();
	}

	componentDidUpdate(prevProps) {
		if (this.props.address !== prevProps.address) {
			this.updateBalance();
		}
	}

	updateBalance = () => {
		if (this.props.address) {
			fetchBalance(this.props.address,
				result => { this.setState({ balance: result }); }
			);
		} else {
			this.setState({ balance: null });
		}
	};

	render() {
		return ( <KeyValueRow k="Balance" v={coinVerbose(this.state.balance)}/> );
	}
}

class Stake extends Component {
	state = { stake: { amount: "loading...", validator: null, delegates: [] } };

	componentDidMount() {
		this.updateStake();
	}

	componentDidUpdate(prevProps) {
		if (this.props.address !== prevProps.address) {
			this.updateStake();
		}
	}

	updateStake = () => {
		if (this.props.address) {
			fetchStake(this.props.address,
				result => { this.setState({ stake: result }); }
			);
		} else {
			this.setState({ stake: { amount: null } });
		}
	};

	render() {
		var stake = this.state.stake;
		if (!stake) stake = { amount: 0 };
		var desc;
		if (stake.validator) {
			desc = (
				<span>
					{coinVerbose(stake.amount)} for
					validator {validatorLink(pub2address(stake.validator))}
				</span>
			);
		} else {
			desc = 'none';
		}
		var ds;
		if (stake.delegates) {
			ds = (
				<div className="container">
					<ul>
						{ stake.delegates.map((d) => {
							return (<li key={d.delegator}><span>
									{coinVerbose(d.amount)} from
									account {accountLink(d.delegator)}
							</span></li>)
						}) }
					</ul>
				</div>
			);
		} else {
			ds = ''
		}
		return (
			<div>
				<KeyValueRow k="Stake" v={desc}/>
				{ds}
			</div>
		);
	}
}

class Delegate extends Component {
	state = { delegate: { amount: "loading...", delegatee: null } };

	componentDidMount() {
		this.updateDelegate();
	}

	componentDidUpdate(prevProps) {
		if (this.props.address !== prevProps.address) {
			this.updateDelegate();
		}
	}

	updateDelegate = () => {
		if (this.props.address) {
			fetchDelegate(this.props.address,
				result => { this.setState({ delegate: result }); }
			);
		} else {
			this.setState({ delegate: { amount: null } });
		}
	};

	render() {
		var delegate = this.state.delegate;
		if (!delegate) delegate = { amount: 0 };
		var desc;
		if (delegate.delegatee) {
			desc = (
				<span>
					{coinVerbose(delegate.amount)} to
					account {accountLink(delegate.delegatee)}
				</span>
			);
		} else {
			desc = 'none';
		}
		return ( <KeyValueRow k="Delegate" v={desc}/> );
	}
}

class AccountTxs extends Component {
	state = { txs: [] };

	componentDidMount() {
		this.updateTxs();
	}

	componentDidUpdate(prevProps) {
		if (this.props.address !== prevProps.address) {
			this.updateTxs();
		}
	}

	updateTxs = () => {
		if (this.props.address) {
			fetchTxsByAccount(this.props.address,
				result => { this.setState({ txs: result }); }
			);
		} else {
			this.setState({ txs: [] });
		}
	};

	// TODO: pagination
	render() {
		return (
			<div>Tx list sent from this account ({this.state.txs.length} transactions):
				<TxBriefList txs={this.state.txs}/>
			</div>
		);
	}
}

export default withRouter(Account);
