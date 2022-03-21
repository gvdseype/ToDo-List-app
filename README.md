# To-Do List (Node application)

##### How to run this program / requirements

* `npm` needs to be installed in the main directory of the project
* Node version should be `> 9.0`  but `<= LTS Dubnium (v10.24.1)`
* Run `npm start` in the terminal from the main directory once the former 2 requirements are fulfilled.

**Note:** Once `npm start` command is given in the terminal you should be able to run the app in the browser with the url `localhost:3000` or similar, depending on the port available. 



##### Description of the app

The app is a simple To-Do list manager. 

1. Create a new to-do by clicking the `+Add New to-do` link.
2. Update any existing to-do by clicking on their title. This will prompt a form pre-filled with the existing data.
3. Delete any existing to-do by clicking on the bin right next to its title.

On the left side a navigator regroups all the to-do's by due date, as well as their status of completion. 



### Implementation

##### Application Structure

Our framework uses the MVC model:

* The Model represents the local representation of our contacts.
* The View's role is to output the right data at the right place, depending on the user's interaction with the page.
* The Controller will be the interface that connects the Model and View with each other. 

##### Application workflow

1. The Controller fetches the data when calling the `getTodos` method. This `getTodos` method will also be called any time we add, update or delete a todo, in the `addTodo`, `updateTodo`, and `deleteTodo` respectively. 
2. The `getTodos` method provides the data to our `Model` via the `assignTodos`. The `Model` has a `structureData` method which will structure our data according their completeness status. After this `assignTodos` will  automatically provide the View with the data via its method `onTodoListChanged` and `onSelectionChanged` methods. These two callback methods are bound via the help of the Controller, which unlike the Model does have access to the View. 
3. The two callbacks method provide the the View method `displayPage` and `displaySelection` with the updated data of our todo's. 
4. The `displayPage `takes care of the navigation part, while the `displaySelection` manages the selected Todos based on the value of the `selector`.
5. The `selector` is a variable from the View which is automatically set on `all`, which by this logic displays all the todos when loading/refreshing the page.
6. The `displaySelection` will also be called anytime a category of todo's is selected in the navigate pane through event listeners on the navigate pane elements.
7. Adding a new to-do is done by clicking on the Add todo link. An event listenerin the `addTodo`  will prompt a form to collect the required data. By clicking on the save button the data is submitted and displayed on the page. The completed button is by default disabled, as we first require the to-do to exist to edit. the `addTodo` will use the handler received from the Controller to add to the data. 
8. Editing can be done by clicking on the title of the to-do. Via an event listener within the `editShownItems` a new form will be displayed with the data of the to-do filled in as placeholders. The editing form also allows to mark a todo as complete. Once completed the `editShownItems` will call the handler received by the Controller. 
9. Marking a to-do as completed can also be achieved by clicking the on the checkbox. This is done with an event listener in the `markCompleted` method. Once completed the `markCompleted` will call the handler received by the Controller. 
10. Clicking on the bin deletes any existing to-do. This is done with an event listener in the `deleteTodo` method. It will use a handler from the Controller once collecting the `id` property of the todo. 



##### 



