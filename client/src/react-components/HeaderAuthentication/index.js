import React from "react";
import "./styles.css";
import { NavLink } from "react-router-dom";
import { Button } from "@material-ui/core";
import LoginPopup from "../LoginPopup";

import { GlobalStateContext } from "../GlobalState";

class HeaderAuthentication extends React.Component {
	static contextType = GlobalStateContext;

	constructor(props) {
		super(props);
		this.state = {
			displayLoginPopup: false,
		};
	}

	toggleLoginPopup = () => {
		this.setState({
			displayLoginPopup: !this.state.displayLoginPopup,
		});
	};

	render() {
		const { displayLoginPopup } = this.state;
		const { isAuthenticated, signOut } = this.context;
		const { isAdmin } = this.context;

		return (
			<ul className="navRight">
				{isAuthenticated ? (
					isAdmin ? (
						<div>
							<li>
								<NavLink to="/" className="headerTextL" onClick={signOut}>
									<span className="headerText">Sign Out</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="/admin" className="headerTextL">
									<span className="headerText">Admin</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="/profile" className="headerTextL">
									<span className="headerText">Profile</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="/my-events" className="headerTextL">
									<span className="headerText">My Events</span>
								</NavLink>
							</li>
						</div>
					) : (
						<div>
							<li>
								<NavLink to="/" className="headerTextL" onClick={signOut}>
									<span className="headerText">Sign Out</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="/profile" className="headerTextL">
									<span className="headerText">Profile</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="/my-events" className="headerTextL">
									<span className="headerText">My Events</span>
								</NavLink>
							</li>
						</div>
					)
				) : (
					<div>
						<li className="loginPopup">
							<p className="headerTextLogIn" onClick={this.toggleLoginPopup}>
								<span className="headerLogIn">Log In</span>
							</p>
							{displayLoginPopup && <LoginPopup />}
						</li>
						<li>
							<NavLink to="/sign-up" className="headerTextL">
								<span className="headerText">Sign Up</span>
							</NavLink>
						</li>
					</div>
				)}
			</ul>
		);
	}
}

export default HeaderAuthentication;
