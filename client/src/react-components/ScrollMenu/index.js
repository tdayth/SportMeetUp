import React from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui/core/styles";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import "./styles.css";

import ENV from "../../config.js";
const API_HOST = ENV.api_host + "/picture/";

class ScrollMenu extends React.Component {
	handleEventSelect = (eventIndex) => {
		const { events, onEventSelect } = this.props;
		const selectedEvent = events[eventIndex];
		onEventSelect(selectedEvent);
	};

	render() {
		const { events } = this.props;

		return (
			<div className="scrollContainer">
				<div className="scrollElements">
					<ul>
						{events.map((event, index) => (
							<li key={index} onClick={(e) => this.handleEventSelect(index)}>
								<Card>
									<CardActionArea>
										<CardMedia
											component="img"
											src={API_HOST + event.picture}
											height="70"
											title={event.sport}
										/>
										<CardContent>
											<Typography gutterBottom variant="h5" component="h2">
												{event.sport}
											</Typography>
											<Typography
												variant="body2"
												color="textSecondary"
												component="p"
											>
												Skill Level:{" "}
												<span className="bold">{event.skillLevel}</span>
												<br />
												People signed up: {event.joinedPeople.length}/
												{event.totalNumPeople}
											</Typography>
										</CardContent>
									</CardActionArea>
								</Card>
							</li>
						))}
					</ul>
				</div>
			</div>
		);
	}
}

export default ScrollMenu;
