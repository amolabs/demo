// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { TxBriefList } from '../components/Tx';
import { TextInput, KeyValueRow, validatorLink } from '../util';
import { fetchBlock } from '../rpc';

class Block extends Component {
	state = {
		height: this.props.match.params.height,
	};

	componentDidUpdate(prevProps) {
		if (this.props.match.params.height !== prevProps.match.params.height) {
			const height = this.props.match.params.height;
			this.setState({ height: height });
		}
	}

	updateHeight = (height) => {
		this.setState({ height: height });
		this.props.history.push('/block/'+height);
	}

	render() {
		return (
			<div className="container">
				<TextInput desc="Height" name="height"
					value={this.state.height}
					button="Query"
					onSubmit={this.updateHeight}/>
				<BlockDetail height={this.state.height}/>
			</div>
		);
	}
}

class BlockDetail extends Component {
	state = {
		block: {
			height: null,
			chain: "loading...",
			hash: "loading...",
			proposer: "loading...",
			numTx: "loading...",
			timestamp: "loading...",
			txs: [],
		}
	};

	componentDidMount() {
		this.updateBlock();
	}

	componentDidUpdate(prevProps) {
		if (this.props.height !== prevProps.height) {
			this.updateBlock();
		}
	}

	updateBlock = () => {
		if (this.props.height) {
			fetchBlock(this.props.height,
				result => {
					this.setState({ block: result });
				}
			);
		} else {
			this.setState({ block: {} });
		}
	};

	render() {
		var heightAlt = this.props.height;
		if (!heightAlt) {
			heightAlt = ( <span>Input block height to inspect &uarr;</span> );
		}
		// TODO: use validatorLink
		const validator = validatorLink(this.state.block.proposer);
		return (
			<div className="container">
				<KeyValueRow k="Height" v={heightAlt} />
				<KeyValueRow k="Chain-ID" v={this.state.block.chain}/>
				<KeyValueRow k="Proposer" v={validator}/>
				<KeyValueRow k="Time" v={this.state.block.timestamp}/>
				<KeyValueRow k="NumTx" v={this.state.block.numTx}/>
				<TxBriefList txs={this.state.block.txs}/>
			</div>
		);
	}
}

export default withRouter(Block);
