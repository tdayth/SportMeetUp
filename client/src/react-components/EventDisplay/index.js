import React from "react";
import "./styles.css";
import { Grid, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import Moment from "react-moment";

import EventLocationMap from "../EventLocationMap";
import { GlobalStateContext } from "../GlobalState";
import { joinEvent, leaveEvent } from "../../actions/event";

import ENV from "../../config.js";
const API_HOST = ENV.api_host + "/picture/";

class EventDisplay extends React.Component {
	static contextType = GlobalStateContext;

	constructor(props, context) {
		super(props, context);

		this.state = {
			showLoginWarning: false,
		};
	}

	onJoinEvent = async () => {
		const { isAuthenticated } = this.context;

		if (!isAuthenticated) {
			console.log("User not logged in");
			this.setState({
				showLoginWarning: true,
			});
			return;
		}

		// User is authenticated
		const { activeEvent } = this.props;
		const result = await joinEvent(activeEvent._id);
		const { status, user } = result;
		console.log(user);

		if (status === 200) {
			await this.props.loadEvents();
			await this.context.getUpdatedUser();
		} else {
			console.log("Something went wrong");
		}
	};

	onLeaveEvent = async () => {
		const { isAuthenticated } = this.context;

		if (!isAuthenticated) {
			console.log("User not logged in");
			this.setState({
				showLoginWarning: true,
			});
			return;
		}

		// User is authenticated
		const { activeEvent } = this.props;
		const result = await leaveEvent(activeEvent._id);
		const { status, user } = result;
		console.log(user);
		if (status === 200) {
			await this.context.getUpdatedUser();
			await this.props.loadEvents();
		} else {
			console.log("Something went wrong");
		}
	};

	checkIfAlreadyJoined = (event) => {
		const { activeUser, isAuthenticated } = this.context;
		if (!isAuthenticated) return false;

		const alreadyJoinedEvent = activeUser.events.find((eventID) => {
			return eventID === event._id;
		});

		return alreadyJoinedEvent !== undefined;
	};

	render() {
		const { activeEvent, wasFilterApplied } = this.props;
		const { showLoginWarning } = this.state;
		const { isAuthenticated, activeUser } = this.context;

		// No events to show
		if (activeEvent == null) {
			console.log("No event to select");
			return <EmptyEventsDisplay wasFilterApplied={wasFilterApplied} />;
		}

		// Check if user has already joined the event
		const haveAlreadyJoined = this.checkIfAlreadyJoined(activeEvent);

		// Check if event is already full
		const eventIsFull =
			activeEvent.joinedPeople.length === activeEvent.totalNumPeople;

		// Never show login warning if user is logged in
		const loginWarning =
			isAuthenticated || eventIsFull ? false : showLoginWarning;

		return (
			<Card>
				<CardHeader
					title={activeEvent.sport}
					subheader={activeEvent.skillLevel}
				/>
				<CardMedia
					component="img"
					src={API_HOST + activeEvent.picture}
					title={activeEvent.sport}
					height="150"
				/>
				<CardContent>
					<Typography variant="body2" color="textSecondary" component="p">
						{activeEvent.description}
					</Typography>
				</CardContent>
				<CardContent>
					<Typography>
						<Moment>{activeEvent.date}</Moment>
						<br />
						{activeEvent.address} ({activeEvent.distance} km from you)
						<br />
						{activeEvent.joinedPeople.length} / {activeEvent.totalNumPeople}{" "}
						people have joined this event.
						<br />
						<br />
					</Typography>
					<div className="joinButtonContainer">
						{haveAlreadyJoined ? (
							<Button
								variant="contained"
								color="secondary"
								className="leaveEventButton"
								onClick={this.onLeaveEvent}
							>
								Leave Event
							</Button>
						) : eventIsFull ? (
							<Button
								variant="contained"
								color="primary"
								className="eventFullButton"
								disabled
							>
								Event is Full
							</Button>
						) : (
							<Button
								variant="contained"
								color="primary"
								className={
									"joinEventButton" + (loginWarning ? " removeRoundBottom" : "")
								}
								onClick={this.onJoinEvent}
							>
								Join Event
							</Button>
						)}
						{loginWarning && (
							<div className="loginWarning">Please log in to join</div>
						)}
					</div>
					<EventLocationMap address={activeEvent.address} />
				</CardContent>
			</Card>
		);
	}
}

class EmptyEventsDisplay extends React.Component {
	render() {
		const { wasFilterApplied } = this.props;

		return (
			<Card>
				<CardHeader
					title="No events available"
					subheader={
						wasFilterApplied
							? "None of the events match selected filters"
							: "Failed to retrieve events from server. Please try again later"
					}
				/>
			</Card>
		);
	}
}

export default EventDisplay;
