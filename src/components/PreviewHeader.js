import { Link } from 'react-router-dom';
import React from 'react';

const PreviewHeader = ({ name, to }) => {
	return (
		<li className="list-group-item preview-header">
			<h4>{name}</h4>
			<Link to={to} className="ml-auto">
				<button className="btn btn-secondary">View All</button>
			</Link>
		</li>
	);
};

export default PreviewHeader;
