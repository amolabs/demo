// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';

class Home extends Component {
	componentDidMount() {
	}

	render() {
		return (
			<div className="container">
				<div className="col-md-10">
					<h2>Welcome to AMO blockchain demo site.</h2>
					<p>
						This site is for demonstrating a data parcel registration and
						trade. This site includes the demo web-wallet feature also.
					</p>
					<p>
						<b>Account</b> and <b>Parcel</b> menu is to examine account
						balances and data parcel information registered on the testnet.
					</p>
					<p>
						<b>Demo</b> menu is for registring a new data parcel and try
						trading a data parcel among test accounts.
					</p>
					<p>
						In <b>Wallet</b> menu, you may set up your own test account and
						transfer arbitrary amount of AMO coins within the testnet.
					</p>
					<hr/>
					<p>
						이 사이트는 데이터 parcel의 등록과 거래를 시연하기 위한
						사이트입니다.
					</p>
					<p>
						<b>Account</b>와 <b>Parcel</b> 메뉴는 계정 잔고와 테스트넷에 등록된
						데이터 parcel의 정보를 조회하기 위한 것입니다.
					</p>
					<p>
						<b>Demo</b> 메뉴에서 새로운 데이터 parcel을 등록하고 시험용 계정
						사이에 거래를 해 볼 수 있습니다.
					</p>
					<p>
						<b>Wallet</b> 메뉴에서 시험용 계정을 설정할 수 있고 테스트넷 내에서
						임의의 양의 AMO 코인을 전송해 볼 수 있습니다.
					</p>
				</div>
			</div>
		);
	}
}

export default Home;
