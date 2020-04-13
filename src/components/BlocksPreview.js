// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PreviewHeader from './PreviewHeader';

class BlocksPreview extends Component {
	render() {
		return (
			<ul className="list-group">
				<PreviewHeader name="Recent Blocks" to="/blocks" />
				{this.props.blocks.map(block => {
					return (
						<BlockPreviewItem
							block={block}
							key={block.height}
							onClick={this.onItemClick}
						/>
					);
				})}
			</ul>
		);
	}
	onItemClick = e => {
		this.props.history.push(`/block/${e}`);
	};
}

const BlockPreviewItem = ({ block, onClick }) => {
	return (
		<li
			className="list-group-item d-flex block-preview-item"
			onClick={() => onClick(block.height)}
		>
			<div className="block d-flex flex-column">
				<div># {block.height}</div>
			</div>
			<div className="block-info">
				<p>hash: {block.hash}</p>
				<p>time: {block.timestamp}</p>
				<p>numTx: {block.numTx}</p>
			</div>
		</li>
	);
};

export default withRouter(BlocksPreview);
