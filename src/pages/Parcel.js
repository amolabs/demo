// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TextInput, KeyValueRow, accountLink } from '../util';
import * as rpc from '../rpc';

class Parcel extends Component {
	state = {
		parcelID: this.props.match.params.parcelID,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.parcelID !== prevProps.match.params.parcelID) {
			const parcelID = this.props.match.params.parcelID;
			this.setState({ parcelID: parcelID });
		}
	}

	applyParcelID = (id) => {
		this.setState({ parcelID: id });
		this.props.history.push('/parcel/'+id);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Parcel ID" name="parcelID"
					value={this.state.parcelID}
					button="Query"
					onSubmit={this.applyParcelID}
				/>
				<ParcelDetail
					parcelID={this.state.parcelID}
					onChangeID={this.applyParcelID}
				/>
			</div>
		);
	}
}

class ParcelDetail extends Component {
	state = {
		parcel: {
			owner: "loading...",
			custody: "loading...",
		}
	};

	componentDidMount() {
		this.updateParcel();
	}

	componentDidUpdate(prevProps) {
		if (this.props.parcelID !== prevProps.parcelID) {
			this.updateParcel();
		}
	}

	updateParcel = () => {
		if (this.props.parcelID) {
			rpc.fetchParcel(this.props.parcelID,
				result => {
					this.setState({ parcel: result?result:{} });
				}
			);
		} else {
			this.setState({ parcel: {} });
		}
	};

	render() {
		var parcelIDAlt = this.props.parcelID;
		if (!parcelIDAlt) {
			parcelIDAlt = ( <span>Upload a new file or input parcel ID to inspect &uarr;</span> );
		}
		const parcel = this.state.parcel;
		return (
			<div className="container">
				<KeyValueRow k="Parcel ID" v={parcelIDAlt} />
				<KeyValueRow k="Owner" v={accountLink(parcel.owner)} />
				<KeyValueRow k="Owner Key Custody" v={parcel.custody} />
				<ParcelMetadata
					parcelID={this.props.parcelID}
					onChangeID={this.props.onChangeID}
				/>
			</div>
		);
	}
}

class ParcelMetadata extends Component {
	state = {
		metadata: null,
		alt: null,
	};

	componentDidMount() {
		this.updateMetadata(this.props.parcelID);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.parcelID !== prevProps.parcelID) {
			this.updateMetadata(this.props.parcelID);
		}
	}

	updateMetadata = (id) => {
		if (!id) {
			this.setState({
				metadata: null,
			});
			return;
		} else {
			this.setState({alt: 'loading...'});
			rpc.inspectParcel(id, (err, meta) => {
				if (err) {
					this.setState({
						metadata: null,
						alt: 'failed to get data parcel',
					});
				} else {
					this.setState({
						metadata: meta,
						alt: null,
					});
				}
			});
		}
	}

	render() {
		var metadata;
		if (this.state.metadata) {
			metadata = this.state.metadata;
		} else {
			metadata = this.state.alt;
		}

		return (
			<KeyValueRow k="Metadata" v={JSON.stringify(metadata)} />
		);
	}
}

export default withRouter(Parcel);
