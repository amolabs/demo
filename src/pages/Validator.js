// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow, accountLink } from '../util';
import { fetchStakeHolder, fetchValidator } from '../rpc';

class Validator extends Component {
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
		this.props.history.push('/validator/'+address);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Address" name="address"
					value={this.state.address}
					button="Query"
					onSubmit={this.updateAddress}/>
				<ValidatorDetail address={this.state.address}/>
			</div>
		);
	}
}

const ValidatorDetail = ({address}) => {
	// XXX there's nothing useful to manage as 'state' here
	var addressAlt = address;
	if (!address) {
		addressAlt = ( <span>Input validator address to inspect &uarr;</span> );
	}
	return (
		<div className="container">
			<KeyValueRow k="Address" v={addressAlt} />
			<Holder valAddress={address}/>
			<TmValidator valAddress={address}/>
		</div>
	);
};

class Holder extends Component {
	state = { holder: "loading..." };

	componentDidMount() {
		this.updateHolder();
	}

	componentDidUpdate(prevProps) {
		if (this.props.valAddress !== prevProps.valAddress) {
			this.updateHolder();
		}
	}

	updateHolder = () => {
		if (this.props.valAddress) {
			fetchStakeHolder(this.props.valAddress,
				result => { this.setState({ holder: result }); }
			);
		} else {
			this.setState({ holder: null });
		}
	};

	render() {
		return (
			<KeyValueRow k="Holder" v={accountLink(this.state.holder)} />
		);
	}
}

class TmValidator extends Component {
	state = { pubkey: 'loading...', power: 'loading...' };

	componentDidMount() {
		this.updateValidator();
	}

	componentDidUpdate(prevProps) {
		if (this.props.valAddress !== prevProps.valAddress) {
			this.updateValidator();
		}
	}

	updateValidator = () => {
		if (this.props.valAddress) {
			fetchValidator(this.props.valAddress,
				(val) => {
					if (val) {
						this.setState({
							pubkey: val.pubkey,
							power: val.voting_power
						});
					} else {
						this.setState({ pubkey: 'none', power: 0 });
					}
				}
			);
		} else {
			this.setState({ holder: null });
		}
	};

	render() {
		return (<div>
			<KeyValueRow k="Public Key" v={this.state.pubkey} />
			<KeyValueRow k="Voting Power" v={this.state.power} />
		</div>);
	}
}

export default withRouter(Validator);
