// vim: set noexpandtab ts=2 sw=2 :
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

const pages = 5;

class PageNav extends Component {
	render() {
		const totalPage = Math.ceil(
			this.props.totalItem / this.props.itemPerPage
		);
		const navIndex = Math.floor((this.props.currentPage - 1) / pages);

		const left = navIndex > 0;
		const right = (navIndex + 1) * pages < totalPage;

		return (
			<nav>
				<ul className="pagination justify-content-center">
					{left && (
						<li className="page-item">
							<Link
								className="page-link"
								to={`${this.props.baseURL}?p=${navIndex *
									pages}`}
								aria-label="Previous"
							>
								<span aria-hidden="true">&laquo;</span>
								<span className="sr-only">Previous</span>
							</Link>
						</li>
					)}

					{Array.from(Array(pages).keys()).reduce((result, i) => {
						const pageIndex = navIndex * pages + i + 1;
						const active = pageIndex === this.props.currentPage;

						const pageItemClass =
							'page-item' + (active ? ' active' : '');

						if (pageIndex <= totalPage)
							result.push(
								<li className={pageItemClass} key={i}>
									<Link
										className="page-link"
										to={`${
											this.props.baseURL
										}?p=${pageIndex}`}
									>
										{pageIndex}
									</Link>
								</li>
							);
						return result;
					}, [])}
					{right && (
						<li className="page-item">
							<Link
								className="page-link"
								to={`${this.props.baseURL}?p=${(navIndex + 1) *
									pages +
									1}`}
								aria-label="Next"
							>
								<span aria-hidden="true">&raquo;</span>
								<span className="sr-only">Next</span>
							</Link>
						</li>
					)}
				</ul>
			</nav>
		);
	}
}

export default PageNav;
