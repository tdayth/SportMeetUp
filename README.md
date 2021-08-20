# SportMeetUp

# Description
The overall purpose of our website is to allow people to create and join sport events that are organized by others. Due to COVID-19, many of us are restrained from participating in any joint activities in order to reduce the risk of spreading the virus. However, after the pandemic, we will all need to compensate for the lost opportunities. Hence, our web application will allow people to easily find sporting events of their interest / neighbourhood. Moreover, people will be able to organize soccer games, chess tournaments, etc in their neighborhoods and enjoy the active way of socializing. The direct benefit of our web application is to allow users to come back to an active way of living fast and easy after the pandemic. 

# Key Features
A user can choose to add an event or join an event on the website. Users can access a powerful search tool that can direct them to appropriate sporting events. They can search using filters to help break down all the information available. Users can access the whole list of events only when they are logged in. Users must sign up to gain access to any other feature. 

* Admin: 
  * Make other users Admin
  * Delete User
  * Add/delete events
  * Modify Profile

* Logged-in User:
  * Modify profile

* Anyone: 
  * Join events
  * Create Events
  * Search through events
  * Register for an account

# Instructions
  * Sign Up
      * Fill in the form in order to sign up and create a profile
   
  * Login
      * Login after signing up and creating a profile
      * Hard Coded Profiles:
        * Simple User: 
          * username: user 
          * password: user  
        * Admin: 
          * username: admin 
          * password: admin
         
  * Admin functionalities
    * When logged in as an admin, there is a button on the header named "Admin" you can select to manage users and events
    * There are two buttons at the top which can be clicked to either review events or users
    * For review events, the admin can filter the events and then see information on a certain event and then decide to delete it if they want
    * For review users, they can use a search bar to search for users and if that user is not an admin they can either make them an admin or delete the user

  * Profile view
    * When logged in, you can select the "Profile" button on the top to view/edit profile information
     
  * Create an Event
    * Must be signed in to create an event
    * Fill in the input fields and select Add Event to create an event
    * Image does not save currently, but will when implementing the backend
  
  * Search for an Event
    * Can select any event on the left side bar
    * Can use the filters on the top of the side bar to filter events
    * After selecting an event, you can view the information and join the event by selecting the "Join Event" button
  
# Third Party Technologies

  Material UI  
  react-time-picker  
  react-date-picker  
  @react-google-maps/api
  react-geocode  

# Routes

## User Routes:
* Login POST Route:
   * Request URL: ${API_HOST}/users/login
   * Overview: The routes allows a user to login and create a session.
   * Input: The body must contain "email" and "password" of the user.
   * Output: The route returns the current user.
   

* Logout GET Route:
   * Request URL: ${API_HOST}/users/logout
   * Overview: The route allows a user to logout and remove the sessioon.
   * Input: N/A
   * Output: N/A

* Check Session GET Route:
   * Request URL: ${API_HOST}/users/check-session
   * Overview: A route allows to check if a user is logged in on the session.
   * Input: N/A
   * Output: If a session exists the current user will be sent.

* Create User POST Route:
   * Request URL: ${API_HOST}/users
   * Overview: A route allows a user to sign up and store its information in the database.
   * Input: The input is a JSON object in the following format
       ```
       {
         firstName: firstName,
         lastName: lastName,
         email: email,
         address: address,
         password: password
        }
      ```
   * Output: If successful the new user will be sent. 

* Retreieve all Users GET Route:
   * Request URL: ${API_HOST}/users
   * Overview: A route allows admin to pull users and review the users.
   * Input: N/A
   * Output: If successful an array of all users are sent in the form of JSON objects.
 
* Delete a user DELETE Route:
   * Request URL: ${API_HOST}/users/:id
   * Overview: A route allows admin to delete a user.
   * Input: The params of the request must contain the user's id. 
   * Output: If successful the deleted user will be sent.
 
* Change a User's field PATCH Route: 
   * Request URL: ${API_HOST}/users/:id
   * Overview: A route allows a user to update its user information.
   * Input: The params of the request must contain the user's id. Additionally, the body must contain the fields to update with new values like the followng:
      ```
       {
         firstName: newFirstName,
         address: newAddress,
       }
      ```
    
   * Output: If successful the user will be sent.

* Retrieve all events created by user GET Route: 
   * Request URL: ${API_HOST}/users/getEvents
   * Overview: A route allows a user to review its created events.
   * Input: A user must be logged in to be able to call this route
   * Output: If successful a list of events will be sent.

* Retrieve all events joined by user GET Route: 
   * Request URL: ${API_HOST}/users/joinEvents
   * Overview: A route allows a user to see all events joined by a particular user.
   * Input: A user must be logged in to be able to call this route
   * Output: If successful a list of events will be sent.

* Leave event POST Route: 
   * Request URL: ${API_HOST}/users/leaveEvent
   * Overview: A route allows a user to leave an event.
   * Input: A user must be logged in to be able to call this route
   * Output: If successful an updated version of the user will be sent.


## Event Routes:

* Retreive all exisitng events GET Route: 
   * Request URL: ${API_HOST}/api/events
   * Overview: A route to retrieve all of the existing routes.
   * Input: N/A
   * Output: If successful a list of all events will be sent.


* Create an event POST Route: 
   * Request URL: ${API_HOST}/api/events
   * Overview: A route to retrieve all of the existing routes.
   * Input: An event JSON object is passed in the body as follows:
      ```
         {
           sport: sport
           address: address
           date: date
           skillLevel: skillLevel
           totalNumPeople: totalNumPeople
           description: description
         }
        ```
   * Output: If successful the new event will be sent.

* Change a event field PATCH route: 
   * Request URL: ${API_HOST}/api/event
   * Overview: A route to change particular fields of an event.
   * Input: An event JSON object with new fields along with the event id are passed into the body.
   * Output: If successful the updated event will be sent.


* Delete an event DELETE route: 
   * Request URL: ${API_HOST}/api/event
   * Overview: A route to delete an event.
   * Input: Event's id must be passed into the body.
   * Output: If successful the deleted event will be sent back.
