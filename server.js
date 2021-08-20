/* server.js for react-express-authentication */
"use strict";

/* Server environment setup */
// To run in development mode, run normally: node server.js
// To run in development with the test user logged in the backend, run: TEST_USER_ON=true node server.js
// To run in production mode, run in terminal: NODE_ENV=production node server.js
const env = process.env.NODE_ENV; // read the environment variable (will be 'production' in production mode)

const USE_TEST_USER = env !== "production" && process.env.TEST_USER_ON; // option to turn on the test user.
const TEST_USER_ID = "5fb8b011b864666580b4efe3"; // the id of our test user (you will have to replace it with a test user that you made). can also put this into a separate configutation file
const TEST_USER_EMAIL = "test@user.com";

const mongoURI =
	"mongodb+srv://admin:sportify@cluster0.gchsx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
//////

const log = console.log;
const path = require("path");
const fs = require("fs");
const multer = require("multer");
// const storage = multer.memoryStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, "uploads");
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, file.fieldname + "-" + Date.now());
// 	},
// });

// const upload = multer({ storage: storage });
const upload = multer({ dest: "uploads/" });

const express = require("express");
// starting the express server
const app = express();

// enable CORS if in development, for React local development server to connect to the web server.
const cors = require("cors");
if (env !== "production") {
	app.use(cors());
}

// mongoose and mongo connection
const { mongoose } = require("./db/mongoose");
mongoose.set("useFindAndModify", false); // for some deprecation issues

// import the mongoose models
const { User } = require("./models/user");
const { Event } = require("./models/event");
const { Picture } = require("./models/picture");

// to validate object IDs
const { ObjectID } = require("mongodb");

// body-parser: middleware for parsing parts of the request into a usable object (onto req.body)
const bodyParser = require("body-parser");
app.use(bodyParser.json()); // parsing JSON body
app.use(bodyParser.urlencoded({ extended: true })); // parsing URL-encoded form data (from form POST requests)

// express-session for managing user sessions
const session = require("express-session");
const MongoStore = require("connect-mongo"); // to store session information on the database in production

function isMongoError(error) {
	// checks for first error returned by promise rejection if Mongo database suddently disconnects
	return (
		typeof error === "object" &&
		error !== null &&
		error.name === "MongoNetworkError"
	);
}

// middleware for mongo connection error for routes that need it
const mongoChecker = (req, res, next) => {
	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		log("Issue with mongoose connection");
		res.status(500).send("Internal server error");
		return;
	} else {
		next();
	}
};

// Middleware for authentication of resources
const authenticate = (req, res, next) => {
	if (env !== "production" && USE_TEST_USER) req.session.user = TEST_USER_ID; // test user on development. (remember to run `TEST_USER_ON=true node server.js` if you want to use this user.)
	if (req.session.user) {
		User.findById(req.session.user)
			.then((user) => {
				if (!user) {
					return Promise.reject();
				} else {
					req.user = user;
					next();
				}
			})
			.catch((error) => {
				res.status(401).send("Unauthorized");
			});
	} else {
		res.status(401).send("Unauthorized");
	}
};

// Middleware for ADMIN authentication of resources
const adminAuthenticate = (req, res, next) => {
	if (req.session.user) {
		User.findById(req.session.user)
			.then((user) => {
				if (!user || !user.admin) {
					return Promise.reject();
				} else {
					req.user = user;
					next();
				}
			})
			.catch((error) => {
				res.status(401).send("Unauthorized");
			});
	} else {
		res.status(401).send("Unauthorized");
	}
};

/*** Session handling **************************************/
// Create a session and session cookie
app.use(
	session({
		secret: process.env.SESSION_SECRET || "our hardcoded secret", // make a SESSION_SECRET environment variable when deploying (for example, on heroku)
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 30 * 60 * 1000, // 30 minutes
			httpOnly: true,
		},
		// store the sessions on the database in production
		store: MongoStore.create({
			mongoUrl: mongoURI,
		}),
	})
);

// A route to login and create a session
app.post("/users/login", (req, res) => {
	const email = req.body.email;
	const password = req.body.password;

	log(email, password);
	// Use the static method on the User model to find a user
	// by their email and password
	User.findByEmailPassword(email, password)
		.then((user) => {
			// Add the user's id to the session.
			// We can check later if this exists to ensure we are logged in.
			req.session.user = user._id;

			// DO NOT SEND HASHED PASSWORD
			res.send({
				currentUser: {
					admin: user.admin,
					email: user.email,
					address: user.address,
					events: user.events,
					firstName: user.firstName,
					lastName: user.lastName,
					receiveNotifications: user.receiveNotifications,
					_id: user._id,
				},
			});
		})
		.catch((error) => {
			log(error);
			res.status(400).send();
		});
});

// A route to logout a user
app.get("/users/logout", (req, res) => {
	// Remove the session
	req.session.destroy((error) => {
		if (error) {
			res.status(500).send(error);
		} else {
			res.send();
		}
	});
});

// A route to check if a user is logged in on the session
app.get("/users/check-session", async (req, res) => {
	if (env !== "production" && USE_TEST_USER) {
		// test user on development environment.
		req.session.user = TEST_USER_ID;
		req.session.email = TEST_USER_EMAIL;
		res.send({ currentUser: TEST_USER_EMAIL });
		return;
	}
	// log("Checking session:");
	if (req.session.user) {
		const user = await User.findById(req.session.user);

		// DO NOT SEND HASHED PASSWORD
		res.send({
			currentUser: {
				admin: user.admin,
				email: user.email,
				events: user.events,
				firstName: user.firstName,
				lastName: user.lastName,
				receiveNotifications: user.receiveNotifications,
				_id: user._id,
			},
		});
	} else {
		res.status(401).send();
	}
});

/*********************************************************/

/*** API Routes below ************************************/
// User API Route
app.post("/users", mongoChecker, async (req, res) => {
	log(req.body);
	const email = req.body.email;
	User.findByEmail(email)
		.then(() => {
			// Create a new user
			const user = new User({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				address: req.body.address,
				password: req.body.password,
				events: [],
			});

			user.save().then((user) => {
				req.session.user = user._id;

				res.send({
					currentUser: {
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						address: user.address,
						events: user.events,
						admin: user.admin,
						receiveNotifications: user.receiveNotifications,
						_id: user._id,
					},
				});
			});
		})
		.catch((error) => {
			if (isMongoError(error)) {
				// check for if mongo server suddenly disconnected before this request.
				res.status(500).send("Internal server error");
			} else {
				log(error);
				res.status(400).send("Bad Request"); // bad request for changing the student.
			}
		});
});

// a GET route to get all users from the database
// Only admin can make this request
app.get("/users", mongoChecker, adminAuthenticate, async (req, res) => {
	// Get the users
	try {
		const users = await User.find();
		res.send(users); // just the array
	} catch (error) {
		log(error);
		res.status(500).send("Internal Server Error");
	}
});

/// a DELETE route to remove a user by their id.
// Admin can delete any user
// User can only delete himself/herself
app.delete("/users/:id", mongoChecker, authenticate, async (req, res) => {
	const id = req.params.id;

	// Validate id
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Resource not found");
		return;
	}

	// Delete a student by their id
	try {
		const sourceUser = await User.findById(req.session.user);
		const targetUser = await User.findById(id);
		// Check if this is admin
		if (sourceUser.admin) {
			// Check if admin is deleting another admin
			if (targetUser.admin) {
				res.status(401).send("Unauthorized");
				return;
			}
			// Otherwise OK.
		} else if (req.session.user !== id) {
			// If not admin:
			// Check if user deleting another user
			res.status(401).send("Unauthorized");
			return;
		}

		const user = await User.findOneAndRemove({ _id: id });
		if (!user) {
			res.status(404).send();
		} else {
			res.send(user);
		}
	} catch (error) {
		log(error);
		res.status(500).send(); // server error, could not delete.
	}
});

/// a PATCH route for making *specific* changes to a user.
// The body will be a JSON object with fields to update and new values:
/*
{
  "lastName": "Smith",
  "firstName": "Will",
  ...
}
*/
app.patch("/users/:id", mongoChecker, authenticate, async (req, res) => {
	console.log("Entering Patch");
	const id = req.params.id;

	if (!ObjectID.isValid(id)) {
		res.status(404).send();
		return; // so that we don't run the rest of the handler.
	}

	if (req.session.user !== id) {
		// User is trying to update someone else
		res.status(401).send("Unauthorized");
		return;
	}

	// Update the user by their id.
	try {
		const user = await User.findOneAndUpdate(
			{ _id: id },
			{ $set: req.body },
			{ new: true }
		);
		if (!user) {
			res.status(404).send("Resource not found");
		} else {
			res.send(user);
		}
	} catch (error) {
		log(error);
		if (isMongoError(error)) {
			// check for if mongo server suddenly dissconnected before this request.
			res.status(500).send("Internal server error");
		} else {
			res.status(400).send("Bad Request"); // bad request for changing the student.
		}
	}
});

// a GET route to get all events created by user
app.get("/users/getEvents", mongoChecker, authenticate, async (req, res) => {
	const user = req.session.user;

	// Get the events
	try {
		const events = await Event.find({ creator: user });
		res.send({ events: events });
	} catch (error) {
		log(error);
		res.status(500).send("Internal Server Error");
	}
});

// a GET route to get all events joined by user
app.get(
	"/users/getJoinedEvents",
	mongoChecker,
	authenticate,
	async (req, res) => {
		const userId = req.session.user;

		// Get the events
		try {
			const userObject = await User.findById(userId);
			const events = await Event.find({
				_id: { $in: userObject.events },
			});

			res.send({ events: events });
		} catch (error) {
			log(error);
			res.status(500).send("Internal Server Error");
		}
	}
);

// // a POST route for user to *join* the event
app.post("/users/joinEvent", mongoChecker, authenticate, async (req, res) => {
	// Get user ID from the session
	const userId = req.session.user;
	const eventId = req.body.eventId;

	if (!ObjectID.isValid(eventId)) {
		res.status(404).send("Resource not found");
		return;
	}

	// Id is valid, add user to the event
	// and add event to the user
	try {
		const user = await User.findById(userId);
		const event = await Event.findById(eventId);

		const filteredJoinedPeople = event.joinedPeople.filter(
			(user) => user._id == userId
		);

		if (filteredJoinedPeople.length === 1) {
			// User has already joined
			res.status(400).send("User has already joined");
			return;
		}

		user.events.push(eventId);
		event.joinedPeople.push(userId);
		const updatedUser = await user.save();
		await event.save();

		res.send(updatedUser);
	} catch (error) {
		log(error); // log server error to the console, not to the client.
		if (isMongoError(error)) {
			// check for if mongo server suddenly dissconnected before this request.
			res.status(500).send("Internal server error");
		} else {
			res.status(400).send("Bad Request"); // 400 for bad request gets sent to client.
		}
	}
});

// a POST route for user to *leave* the event
app.post("/users/leaveEvent", mongoChecker, authenticate, async (req, res) => {
	// Get user ID from the session
	const userId = req.session.user;
	const eventId = req.body.eventId;

	if (!ObjectID.isValid(eventId)) {
		res.status(404).send("Resource not found");
		return;
	}

	// Id is valid, add user to the event
	// and add event to the user
	try {
		await User.findByIdAndUpdate(userId, {
			$pull: { events: eventId },
		});

		// Check if user is in the event's joinedPeople list
		const eventUnchanged = await Event.findById(eventId);
		if (!eventUnchanged.joinedPeople.some((person) => person._id == userId)) {
			// User had not joined the event earlier
			res.status(400).send("User had not joined the event");
			return;
		}

		await Event.findByIdAndUpdate(eventId, {
			$pull: { joinedPeople: userId },
		});

		const event = await Event.findById(eventId);
		await event.save();

		const updatedUser = await User.findById(userId);
		res.send(updatedUser);
	} catch (error) {
		log(error); // log server error to the console, not to the client.
		if (isMongoError(error)) {
			// check for if mongo server suddenly dissconnected before this request.
			res.status(500).send("Internal server error");
		} else {
			res.status(400).send("Bad Request"); // 400 for bad request gets sent to client.
		}
	}
});

/** Event routes **/
// a GET route to get all events
app.get("/api/events", mongoChecker, async (req, res) => {
	// Get the events
	try {
		const events = await Event.find();
		res.send({ events: events });
	} catch (error) {
		log(error);
		res.status(500).send("Internal Server Error");
	}
});

const uploadForm = upload.fields([
	{ name: "file", maxCount: 1 },
	{ name: "event", maxCount: 1 },
]);
// a POST route to *create* an Event
app.post(
	"/api/events",
	mongoChecker,
	authenticate,
	uploadForm,
	async (req, res) => {
		const file = req.files["file"][0];
		const event = JSON.parse(req.body.event);
		log(file);
		log(event);

		const picture = new Picture({
			contentType: file.mimetype,
			image: fs.readFileSync(path.join(__dirname + "/" + file.path)),
		});

		// Check if all fields are present
		if (
			!event.sport ||
			!event.address ||
			!event.date ||
			!event.skillLevel ||
			!event.totalNumPeople ||
			!event.description
		) {
			res.status(400).send("Missing fields in received event object");
			return;
		}

		log("here 1");

		let pictureDB;
		try {
			pictureDB = await picture.save();
			log(pictureDB);
		} catch (e) {
			log(e);
			res.status(500).send("Image upload failed");
			return;
		}

		// Create a new event
		const eventDB = new Event({
			sport: event.sport,
			date: new Date(event.date),
			address: event.address,
			skillLevel: event.skillLevel,
			totalNumPeople: event.totalNumPeople,
			description: event.description,
			picture: pictureDB._id,
			creator: req.user._id, // creator id from the authenticate middleware
		});
		log(eventDB);

		// Save event to the database
		// async-await version:
		try {
			const result = await eventDB.save();
			res.send(result);
		} catch (error) {
			log(error); // log server error to the console, not to the client.
			if (isMongoError(error)) {
				// check for if mongo server suddenly dissconnected before this request.
				res.status(500).send("Internal server error");
			} else {
				res.status(400).send("Bad Request"); // 400 for bad request gets sent to client.
			}
		}
	}
);

// a PATCH route to *update* an Event
//
// pass an object with new event fields
// NOTE: object must have an _id field
// 	so that the function can find which event to update
app.patch("/api/event", mongoChecker, authenticate, async (req, res) => {
	const userId = req.session.user;

	// Check if necessary fields are passed
	if (!req.body.event || !req.body.event._id) {
		res.status(400).send("Bad request");
		return;
	}

	const eventData = req.body.event;
	const eventId = eventData._id;

	// Good practise: Validate id immediately.
	if (!ObjectID.isValid(eventId)) {
		res.status(404).send("Resource not found");
		return;
	}

	// async-await version:
	try {
		const event = await Event.findById(eventId);

		if (event.creator != userId) {
			res.status(401).send("User is not authorized");
			return;
		}

		const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, {
			new: true,
		});

		res.send(updatedEvent);
	} catch (error) {
		log(error); // log server error to the console, not to the client.
		if (isMongoError(error)) {
			// check for if mongo server suddenly dissconnected before this request.
			res.status(500).send("Internal server error");
		} else {
			res.status(400).send("Bad Request"); // 400 for bad request gets sent to client.
		}
	}
});

// a DELETE route to *delete* an Event
app.delete("/api/event", mongoChecker, authenticate, async (req, res) => {
	const eventId = req.body.eventId;
	const userId = req.session.user;

	// Good practise: Validate id immediately.
	if (!ObjectID.isValid(eventId)) {
		res.status(404).send("Resource not found");
		return;
	}

	// async-await version:
	try {
		const event = await Event.findById(eventId);
		const user = await User.findById(userId);
		if (event.creator != userId && !user.admin) {
			res.status(401).send("User is not authorized");
			return;
		}

		const users = event.joinedPeople;

		users.forEach(async (userId) => {
			let user = await User.findById(userId);
			const userUpdatedEvents = user.events.filter(
				(eventId) => !event._id.equals(eventId)
			);

			user.events = userUpdatedEvents;
			await user.save();
		});

		await event.remove();
		res.send(event);
	} catch (error) {
		log(error); // log server error to the console, not to the client.
		if (isMongoError(error)) {
			// check for if mongo server suddenly dissconnected before this request.
			res.status(500).send("Internal server error");
		} else {
			res.status(400).send("Bad Request"); // 400 for bad request gets sent to client.
		}
	}
});

// Pictures
app.get("/picture/:id", mongoChecker, async (req, res) => {
	const id = req.params.id;

	// Good practise: Validate id immediately.
	if (!ObjectID.isValid(id)) {
		res.status(404).send("Resource not found");
		return;
	}

	try {
		const picture = await Picture.findById(id);
		res.set({ "Content-Type": picture.contentType }).send(picture.image);
	} catch (error) {
		log(error);
		if (isMongoError(error)) {
			res.status(500).send("Internal server error");
		} else {
			res.status(400).send("Bad Request");
		}
	}
});

/*** Webpage routes below **********************************/
// Serve the build
app.use(express.static(path.join(__dirname, "/client/build")));

// All routes other than above will go to index.html
app.get("*", (req, res) => {
	// check for page routes that we expect in the frontend to provide correct status code.
	const goodPageRoutes = [
		"/",
		"/log-in",
		"/create-event",
		"/search-events",
		"/profile",
		"/sign-up",
		"/admin",
	];
	if (!goodPageRoutes.includes(req.url)) {
		// if url not in expected page routes, set status to 404.
		res.status(404);
	}

	// send index.html
	res.sendFile(path.join(__dirname, "/client/build/index.html"));
});

/*************************************************/
// Express server listening...
const port = process.env.PORT || 5000;
app.listen(port, () => {
	log(`Listening on port ${port}...`);
});
