// vim: set noexpandtab ts=2 sw=2 :
import React from 'react';
import { accountLink, txLink, parcelLink, coinVerbose } from '../util';

export const TxBody = ({tx}) => {
	switch (tx.type) {
		case 'transfer':
			return (<TxTransfer txBody={tx.payload} />);
		case 'stake':
			return (<TxStake txBody={tx.payload} />);
		case 'withdraw':
			return (<TxWithdraw txBody={tx.payload} />);
		case 'delegate':
			return (<TxDelegate txBody={tx.payload} />);
		case 'retract':
			return (<TxRetract txBody={tx.payload} />);
		case 'register':
			return (<TxRegister txBody={tx.payload} />);
		case 'discard':
			return (<TxDiscard txBody={tx.payload} />);
		case 'request':
			return (<TxRequest txBody={tx.payload} />);
		case 'cancel':
			return (<TxCancel txBody={tx.payload} />);
		case 'grant':
			return (<TxGrant txBody={tx.payload} />);
		case 'revoke':
			return (<TxRevoke txBody={tx.payload} />);
		default:
			return (<div>Unknown transaction type</div>);
	}
};

const TxTransfer = ({txBody}) => {
	return (
		<div>
			<div>To (Recipient): {accountLink(txBody.to)}</div>
			<div>Amount: {coinVerbose(txBody.amount)}</div>
		</div>
	);
}

const TxStake = ({txBody}) => {
	// TODO: use validator pubkey link
	return (
		<div>
			<div>Validator pubkey: {txBody.validator}</div>
			<div>Amount: {coinVerbose(txBody.amount)}</div>
		</div>
	);
}

const TxWithdraw = ({txBody}) => {
	// TODO: use validator pubkey link
	return (
		<div>
			<div>Amount: {coinVerbose(txBody.amount)}</div>
		</div>
	);
}

const TxDelegate = ({txBody}) => {
	return (
		<div>
			<div>To (Delegatee): {accountLink(txBody.to)}</div>
			<div>Amount: {coinVerbose(txBody.amount)}</div>
		</div>
	);
}

const TxRetract = ({txBody}) => {
	return (
		<div>
			<div>Amount: {coinVerbose(txBody.amount)}</div>
		</div>
	);
}

const TxRegister = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Key Custody: {txBody.custody}</div>
		</div>
	);
}

const TxDiscard = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
		</div>
	);
}

const TxRequest = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Payment: {coinVerbose(txBody.payment)}</div>
		</div>
	);
}

const TxCancel = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
		</div>
	);
}

const TxGrant = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Grantee: {accountLink(txBody.grantee)}</div>
			<div>Key Custody: {txBody.custody}</div>
		</div>
	);
}

const TxRevoke = ({txBody}) => {
	return (
		<div>
			<div>Parcel: {parcelLink(txBody.target)}</div>
			<div>Grantee: {accountLink(txBody.grantee)}</div>
		</div>
	);
}

export const TxBriefList = ({txs}) => {
	if (!txs) txs = [];
	return (
		<ul>
			{ txs.map((tx) => {
				return (<TxBriefItem key={tx.hash} tx={tx}/>);
			}) }
		</ul>
	);
};

const TxBriefItem = ({tx}) => {
	return (
		<li key={tx.hash}>
			<div>TxHash: {txLink(tx.hash)}</div>
			<div>Sender: {accountLink(tx.sender)}</div>
			<div>Type: {tx.type}</div>
			<TxBody tx={tx} />
		</li>
	);
};

