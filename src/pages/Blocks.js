// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { fetchBlockHeaders, fetchLastHeight } from '../rpc';
import PageNav from '../components/PageNav';
import queryString from 'query-string';

const blocksPerPage = 15;

class Blocks extends Component {
	state = {
		lastHeight: null,
		blocks: [],
	};

	getCurrentPage = () => {
		const pageQuery = queryString.parse(this.props.location.search).p;
		if (pageQuery) return parseInt(pageQuery);
		else return 1;
	};

	populateBlocks = () => {
		const page = this.getCurrentPage();

		fetchLastHeight(lastHeight => {
			fetchBlockHeaders(
				lastHeight - (page - 1) * blocksPerPage,
				blocksPerPage,
				result => {
					this.setState({
						lastHeight: lastHeight,
						blocks: result,
					});
				}
			);
		});
	};

	componentDidMount() {
		this.populateBlocks();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.location.search !== this.props.location.search)
			this.populateBlocks();
	}

	render() {
		return (
			<div className="container-fluid">
				<table className="table table-striped block-table">
					<BlockTableHeader />
					<tbody>
						{this.state.blocks.map(block => {
							return (
								<BlockTableItem
									block={block}
									onClick={this.onItemClick}
									key={block.height}
								/>
							);
						})}
					</tbody>
				</table>
				<PageNav
					baseURL={'/blocks'}
					totalItem={this.state.lastHeight}
					itemPerPage={blocksPerPage}
					currentPage={this.getCurrentPage()}
				/>
			</div>
		);
	}

	onItemClick = e => {
		this.props.history.push(`/block/${e}`);
	};
}

const BlockTableHeader = () => {
	const HeaderItem = ({ name, col }) => {
		return <th className={`header-item col-md-${col}`}>{name}</th>;
	};

	return (
		<thead>
			<tr>
				<HeaderItem name="Height" col={1} />
				<HeaderItem name="Hash" col={4} />
				<HeaderItem name="Proposer" col={4} />
				<HeaderItem name="Tx" col={1} />
				<HeaderItem name="Time" col={2} />
			</tr>
		</thead>
	);
};

const BlockTableItem = ({ block, onClick }) => {
	const RowItem = ({ content, col }) => {
		return <td className={`row-item col-md-${col}`}>{content}</td>;
	};
	return (
		<tr onClick={() => onClick(block.height)}>
			<RowItem content={block.height} col={1} />
			<RowItem content={block.hash} col={4} />
			<RowItem content={block.proposer} col={4} />
			<RowItem content={block.numTx} col={1} />
			<RowItem content={block.timestamp} col={2} />
		</tr>
	);
};

export default withRouter(Blocks);
