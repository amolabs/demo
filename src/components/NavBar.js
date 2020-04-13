// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

class NavBar extends Component {
	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
				<NavBrand />
				<NavBadge />
				<button
					className="navbar-toggler"
					type="button"
					data-toggle="collapse"
					data-target="#navbarCollapse"
				>
					<span className="navbar-toggler-icon" />
				</button>
				<div className="collapse navbar-collapse flex-md-column">
					<NavMenu pathName={this.props.location.pathname} />
				</div>
			</nav>
		);
	}
}

const NavBrand = () => {
	return (
		<Link to="/" className="navbar-brand">
			<img
				src={process.env.PUBLIC_URL + '/amo.png'}
				width={30}
				alt={'AMO'}
			/>
			<h3 className="navbar-brand-name">AMO Blockchain Demo</h3>
		</Link>
	);
};

const NavBadge = () => {
	// TODO: use global variable
	return (
		<span className="navbar-badge">for Testnet</span>
	);
};

const NavMenu = ({ pathName }) => {
	return (
		<ul className="navbar-nav ml-auto small mb-2 mb-md-0">
			<NavItem name={'Home'} link={'/'} curr={pathName} />
			<NavItem
				name={'Account'}
				link={'/account'}
				curr={pathName}
			/>
			<NavItem
				name={'Parcel'}
				link={'/parcel'}
				curr={pathName}
			/>
			<NavItem
				name={'Trade'}
				link={'/trade'}
				curr={pathName}
			/>
			<NavItem
				name={'Wallet'}
				link={'/wallet'}
				curr={pathName}
			/>
		</ul>
	);
};

const NavItem = ({ name, link, curr }) => {
	var patt = new RegExp(`^${link}(/.*)?$`);
	const active = patt.test(curr);
	return (
		<li className={'nav-item' + (active ? ' active' : '')}>
			<Link className="nav-link" to={link}>
				<h5 className="nav-item-text">{name}</h5>
			</Link>
		</li>
	);
};

export default withRouter(NavBar);
