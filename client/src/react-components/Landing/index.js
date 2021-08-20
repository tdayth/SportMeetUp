import React from "react";
import Button from "@material-ui/core/Button";
import { GlobalStateContext } from "../GlobalState";
import { withRouter } from "react-router-dom";
import "./styles.css";

class Landing extends React.Component {
	static contextType = GlobalStateContext;
	constructor(props) {
		super(props);

		this.state = {};
	}

	loginUser = () => {
		if (this.context.isAuthenticated === true) {
			this.props.history.push("/search-events");
		} else {
			this.props.history.push("/log-in");
		}
	};

	signUpUser = () => {
		if (this.context.isAuthenticated === true) {
			this.props.history.push("/search-events");
		} else {
			this.props.history.push("/sign-up");
		}
	};

	render() {
		return (
			<div id="landingPage">
				<div className="mainContainer">
					<div className="landingHeader">
						<p id="startactiveText">Start an active lifestyle!</p>
						<p id="underh2">Join events to boost your daily activity!</p>
					</div>
					<div className="buttons">
						<ul>
							<li>
								<Button
									variant="contained"
									color="primary"
									onClick={this.signUpUser}
									className="validationButton"
									size="large"
								>
									Sign Up
								</Button>
							</li>

							<li>
								<Button
									variant="contained"
									color="primary"
									className="validationButton"
									size="large"
									onClick={this.loginUser}
								>
									Log In
								</Button>
							</li>
						</ul>
					</div>
					<div className="textContainer">
						<span id="welcomeTitle">Welcome! </span>

						<span id="welcomeText">
							We enjoy seeing you back at our online sporting events hub!
							Staying active is very important! The pandemic has changed our
							lives but it should not impact our activeness. Join sport events
							with your friends and accelerate the return to the pre-pandemic
							lifestyle. Let's burn calories in a fun and socializable way!!!
						</span>
					</div>
				</div>
			</div>
		);
	}
}

export default withRouter(Landing);
