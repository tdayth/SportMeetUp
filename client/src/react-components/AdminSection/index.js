import React from "react";
import Grid from "@material-ui/core/Grid";
import Select from "@material-ui/core/Select";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import AdminSideBarHeader from "../AdminSideBarHeader";
import SearchBarHeader from "../SearchBarHeader";
import AdminScrollMenu from "../AdminScrollMenu";
import UserScrollMenu from "../UserScrollMenu";
import AdminEventDisplay from "../AdminEventDisplay";
import UserDisplay from "../UserDisplay";

import volleyball from "../../images/volleyball.jpeg";
import basketball from "../../images/basketball.jpg";
import baseball from "../../images/baseball.jpg";
import soccer from "../../images/soccer.jpeg";

import { getEvents } from "../../actions/event";
import { deleteEvent } from "../../actions/event";

import Input from "./../Input";
import { GlobalStateContext } from "../GlobalState";

import "./styles.css";

class AdminSection extends React.Component {
	static contextType = GlobalStateContext;

	constructor(props, context) {
		super(props, context);

		this.state = {
			showEvents: true,
			events: [],
			activeEvent: null,
			filteredEvents: [],
			checkedList: checkedList,
			usersList: [],
			activeUser: null,
			filteredUsers: [],
		};

		console.log(this.state);
	}

	showEvents = () => {
		this.setState({
			showEvents: true,
		});
	};

	showUsers = () => {
		this.context.getUsers().then(() => {
			console.log(this.context);
			console.log(this.context.users);
			this.setState({
				showEvents: false,
				usersList: this.context.users,
				activeUser: this.context.users[0],
				filteredUsers: this.context.users,
			});
			console.log("Here");
			console.log(this.state.usersList);
		});
	};

	onEventSelect = (event) => {
		this.setState({
			activeEvent: event,
		});
	};

	onUserSelect = (user) => {
		this.setState({
			activeUser: user,
		});
		console.log(this.state);
	};

	searchUsers = (text) => {
		let filteredList = this.state.usersList;
		if (text === "") {
			filteredList = this.state.usersList;
		} else {
			filteredList = [];
			for (let i = 0; i < this.state.usersList.length; i++) {
				let user = this.state.usersList[i];
				let full_name = user.firstName + " " + user.lastName;
				full_name = full_name.toLowerCase();
				if (
					user.firstName.toLowerCase().includes(text) ||
					user.lastName.toLowerCase().includes(text) ||
					full_name.includes(text)
				) {
					filteredList.push(user);
				}
			}
		}

		this.setState({
			filteredUsers: filteredList,
		});
	};

	// Returns event if event satifies all filters. Used in SearchEvents.
	toDisplayEvent = (currentEvent) => {
		for (let i = 0; i < 5; i++) {
			if (
				currentEvent.sport == this.state.checkedList[i].name &&
				this.state.checkedList[i].checked
			) {
				for (let i = 5; i < 8; i++) {
					if (
						currentEvent.skillLevel == this.state.checkedList[i].name &&
						this.state.checkedList[i].checked
					) {
						for (let i = 8; i < 12; i++) {
							if (
								currentEvent.distance <= this.state.checkedList[i].name &&
								this.state.checkedList[i].checked
							) {
								return true;
							}
						}
					}
				}
			}
		}
	};

	filterEvents = () => {
		const { activeEvent, events } = this.state;
		const filteredEvents = events.filter((event) => this.toDisplayEvent(event));

		// If there is no active events
		if (activeEvent == null) {
			this.setState({
				activeEvent: filteredEvents[0],
				filteredEvents: filteredEvents,
			});
			return;
		}

		// There is an activeEvent, check if it's still present in the filteredList
		const newActiveElement = filteredEvents.find(
			(event) => event.id === activeEvent.id
		);
		if (newActiveElement == null) {
			this.setState({
				activeEvent: filteredEvents[0],
				filteredEvents: filteredEvents,
			});
		} else {
			this.setState({
				filteredEvents: filteredEvents,
			});
		}
	};

	// Changes checked with onChange in FilterPopup
	handleChecked = (selectedItem) => {
		let checkedList = this.state.checkedList;
		checkedList.forEach((ch) => {
			if (ch.name === selectedItem.target.name)
				ch.checked = selectedItem.target.checked;
		});
		this.setState({ checkedList: checkedList });
	};

	onFiltersReset = () => {
		let { checkedList } = this.state;

		for (var i = 0; i < checkedList.length; i++) {
			checkedList[i].checked = true;
		}
		this.setState({ checkedList: checkedList });
	};

	wasFilterApplied = () => {
		return !this.state.checkedList.every((check) => check.checked);
	};

	// Some work here below got to delete now

	deleteUser = (userId) => {
		this.context.deleteUser(userId);

		this.context.getUsers().then(() => {
			console.log(this.context);
			console.log(this.context.users);
			this.setState({
				showEvents: false,
				usersList: this.context.users,
				activeUser: this.context.users[0],
				filteredUsers: this.context.users,
			});
			console.log("Here");
			console.log(this.state.usersList);
		});
	};

	makeAdmin = (id) => {
		this.context.makeAdmin(id);
	};

	updateActiveEvent(eventId) {
		const { events } = this.state;
		for (let i = 0; i < events.length; i++) {
			const event = events[i];
			if (event._id === eventId) {
				this.setState({
					activeEvent: event,
				});
				return;
			}
		}
	}

	loadEvents = async () => {
		const { activeEvent } = this.state;
		const { activeUser } = this.context;
		const events = await getEvents(activeUser);

		if (events.length > 0 && !activeEvent)
			this.setState({
				activeEvent: events[0],
				events: events,
			});
		else {
			this.setState({
				events: events,
			});
			this.updateActiveEvent(activeEvent._id);
		}

		this.filterEvents();
	};

	onDelete = async (eventId) => {
		console.log(eventId);
		const result = await deleteEvent(eventId);
		if (result.status === 200) {
			console.log("Event deleted");
			this.loadEvents();
		} else {
			console.log("Something went wrong");
		}
	};

	componentDidMount() {
		this.loadEvents();
	}

	render() {
		const {
			events,
			activeEvent,
			filteredEvents,
			checkedList,
			filteredUsers,
		} = this.state;
		const wasFilterApplied = this.wasFilterApplied();

		return (
			<div className="super">
				<div className="CreateAnEvent"></div>

				<div className="title"> Admin Page </div>

				<Button
					variant="contained"
					color="primary"
					onClick={this.showEvents}
					className="filter_button"
				>
					Review Events
				</Button>

				<Button
					variant="contained"
					color="primary"
					onClick={this.showUsers}
					className="filter_button"
				>
					Review Users
				</Button>

				{this.state.showEvents ? (
					<div className="body">
						<div className="gridAdmin">
							<Grid container spacing={4}>
								<Grid item xs={4} sm={4} md={4} lg={3} xl={3}>
									<AdminSideBarHeader
										className="searchBarHeader"
										checkedList={checkedList}
										handleChecked={this.handleChecked}
										filterEvents={this.filterEvents}
										onFiltersReset={this.onFiltersReset}
									/>
									<AdminScrollMenu
										className="scrollBarBody"
										events={filteredEvents}
										onEventSelect={this.onEventSelect}
									/>
								</Grid>
								<Grid item xs={8} sm={8} md={8} lg={9} xl={9}>
									<AdminEventDisplay
										activeEvent={activeEvent}
										wasFilterApplied={wasFilterApplied}
										onDelete={this.onDelete}
									/>
								</Grid>
							</Grid>
						</div>
					</div>
				) : (
					<div className="body">
						<div className="gridAdmin">
							<Grid container spacing={4}>
								<Grid item xs={4} sm={4} md={4} lg={3} xl={3}>
									Search Bar
									<SearchBarHeader
										className="searchBarHeader"
										searchUsers={this.searchUsers}
									/>
									<UserScrollMenu
										className="scrollBarBody"
										users={filteredUsers}
										onUserSelect={this.onUserSelect}
									/>
								</Grid>
								<Grid item xs={8} sm={8} md={8} lg={9} xl={9}>
									User Display
									<UserDisplay
										activeUser={this.state.activeUser}
										makeAdmin={this.makeAdmin}
										deleteUser={this.deleteUser}
									/>
								</Grid>
							</Grid>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default AdminSection;

const checkedList = [
	{ name: "Basketball", checked: true },
	{ name: "Baseball", checked: true },
	{ name: "Soccer", checked: true },
	{ name: "Hockey", checked: true },
	{ name: "Volleyball", checked: true },
	{ name: "Beginner", checked: true },
	{ name: "Amateur", checked: true },
	{ name: "Expert", checked: true },
	{ name: "1", checked: true },
	{ name: "10", checked: true },
	{ name: "50", checked: true },
	{ name: "100", checked: true },
	{ name: "Today", checked: true },
	{ name: "Tomorrow", checked: true },
	{ name: "This week", checked: true },
];
