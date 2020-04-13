// vim: set noexpandtab ts=2 sw=2 :
import sha256 from 'js-sha256';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class TextInput extends Component {
	state = {
		value: this.props.value,
	};

	componentDidUpdate(prevProps) {
		if (this.props.value !== prevProps.value) {
			this.setState({ value: this.props.value });
		}
	}

	handleChange = (e) => {
		this.setState({ value: e.target.value });
	};

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.onSubmit(this.state.value);
	};

	render() {
		const desc = this.props.desc;
		const name = this.props.name;
		const button = this.props.button;
		return (
			<div className="container">
				<form className="d-flex flex-column mt-3" onSubmit={this.handleSubmit}>
					<div className="input-group mb-3">
						<span className="input-group-text" id="basic-addon1">{desc}</span>
						<input
							type="text" className="form-control"
							name={name} value={this.state.value?this.state.value:''}
							onChange={this.handleChange}
						/>
						<button type="submit" className="btn btn-secondary ml-auto">
							{button}
						</button>
					</div>
				</form>
			</div>
		);
	}
}

export const KeyValueRow = ({ k, v }) => {
	return ( <div> {k} : {v} </div> );
};

export const blockLink = (height) => {
	return ( <Link to={"/block/" + height}>{height}</Link>);
};

export const txLink = (hash) => {
	return ( <Link to={"/tx/" + hash}>{hash}</Link>);
};

export const accountLink = (address) => {
	return ( <Link to={"/account/" + address}>{address}</Link> );
};

export const validatorLink = (address) => {
	return ( <Link to={"/validator/" + address}>{address}</Link>);
};

export const parcelLink = (parcelID) => {
	return ( <Link to={"/parcel/" + parcelID}>{parcelID}</Link>);
};

export function coinVerbose(mote) {
	if (!mote) {
		mote = 0;
	}
	return mote + ' mote (' + mote/1000000000000000000 + ' AMO)';
}

export function array2hex(bytearray) {
	return bytearray.reduce((out, elem) =>
		(out + ('0' + elem.toString(16)).slice(-2)),
		'');
}

export function pub2address(bin) {
	return sha256(bin).slice(0,40);
}
