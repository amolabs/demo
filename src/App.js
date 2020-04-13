// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import NavBar from './components/NavBar';
import Home from './pages/Home';
import Account from './pages/Account';
import Parcel from './pages/Parcel';
import Trade from './pages/Trade';
import Wallet from './pages/Wallet';

class App extends Component {
	render() {
		return (
			<BrowserRouter>
				<div>
					<NavBar />
					<Switch>
						<Route exact path="/" component={Home} />
						<Route exact path="/account" component={Account} />
						<Route exact path="/account/:address" component={Account} />
						<Route exact path="/parcel" component={Parcel} />
						<Route exact path="/parcel/:parcelID" component={Parcel} />
						<Route exact path="/trade" component={Trade} />
						<Route exact path="/wallet" component={Wallet} />
					</Switch>
				</div>
			</BrowserRouter>
		);
	}
}

export default App;
