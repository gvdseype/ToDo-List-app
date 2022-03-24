let days = ["", "01", "02", "03", "04", "05", "06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30",'31']
let months = {"": "", January: "01", February: "02", March: "03", April: "04", May: "05",June: "06", July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"}
let years = ["", "2014", "2015","2016", "2017", "2018", "2019", "2020", "2021"]

class Model {
  constructor() {
    this.todos = []
    this.allTodosPerDate = {};
    this.allCompleted = {}
    this.onTodoListChanged = null
    this.onInfoTodoChanged = null
    this.selected = []
  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }

  bindSelectionChanged(callback) {
    this.onSelectionChanged = callback
  }

  assignTodos(todos) {
    this.todos = todos;
    this.structureData()
    this.onTodoListChanged([this.allTodosPerDate, this.allCompleted])
    this.onSelectionChanged(this.todos)
  }

  structureData() {
    let self = this
    this.allTodosPerDate = {};
    this.allCompleted = {}
    this.todos.forEach(function(todo) {
      let date;
      let completion = todo.completed
      if (!todo.month || !todo.year) {
        date = 'No Due Date';
      } else {
        date = `${todo.month}/${todo.year}`
      }
      if (self.allTodosPerDate[date]) {
        self.allTodosPerDate[date].push(todo)
      } else {
        self.allTodosPerDate[date] = []
        self.allTodosPerDate[date].push(todo)
      }
      if (completion) {
        if (self.allCompleted[date]) {
          self.allCompleted[date].push(todo)
      } else {
        self.allCompleted[date] = []
        self.allCompleted[date].push(todo)
      }
      }
    })
  }

  returnTodo(id) {
    let result = this.todos.filter(todo => String(todo.id) === id)[0]
    return result
  }
}

class View {
  constructor() {
    $('form').hide()
    this.nav = document.querySelector('nav')
    this.allTodosNav = this.nav.querySelector('#allTodos');
    this.allCompletedNav = this.nav.querySelector('#allCompleted');
    Handlebars.registerPartial('daysPartial', '{{daysPartial}}')
    this.navCompletedElementTemplate = Handlebars.compile(document.querySelector('#navCompletedElementTemplate').innerHTML)
    this.navAllTodosElementTemplate = Handlebars.compile(document.querySelector('#navAllTodoElementTemplate').innerHTML)
    this.itemMakerTemplate = Handlebars.compile(document.querySelector('#itemMakerTemplate').innerHTML)
    this.itemEditorTemplate = Handlebars.compile(document.querySelector('#editForm').innerHTML)
    this.todoListerTemplate = Handlebars.compile(document.querySelector('#todoLister').innerHTML)
    this.currentSelection = document.querySelector('#showTodos')
    this.titleCurrentSelection = document.querySelector('#title')
    this.titleCurrentSelection.textContent = 'All Todos'
    this.mainTitle = document.querySelector('#title')
    this.showForm()
    this.selector = document.querySelector('h3.all')
    this.selectionInformation = {class: '', date: '', amount: 0}
    this.allTodosForm = document.querySelector('#allTodosForm')
    $(this.allTodosForm).show()
  }

  displayPage(todos) {
    let allTodos = Object.assign({}, todos[0]);
    let allCompleted = Object.assign({}, todos[1]);
    this.localTodos = Object.values(allTodos).flat();
    this.updateNavAllTodos(allTodos);
    this.updateNavAllCompleted(allCompleted);
    this.listenToNavForSelection()
    this.focusNav()
    this.getSelectorData(this.selector)
    this.changeTitle()
  }

  changeTitle() {
    let self = this
    let noBullets = document.querySelector('.nobull')
    let navElements = [...noBullets.querySelectorAll('h3')].concat([...noBullets.querySelectorAll('p')])
    let mainTitle = document.querySelector('#title')
    let lastSelector = navElements.filter(function(element) {
      if (element.dataset.status ===  self.selectionInformation.class && element.dataset.date === self.selectionInformation.date) {
        self.selector = element;
        self.focusNav()
        return true
      }
    })[0]
    
    if (lastSelector === undefined) {
      this.getSelectorData(document.querySelector('h3'))
      this.changeTitle()
    } else {
      mainTitle.textContent = `${lastSelector.dataset.date} ${lastSelector.dataset.length}`
    }
  }

  getSelectorData(clickedTarget) {
    this.selectionInformation.class = clickedTarget.dataset.status
    this.selectionInformation.date = clickedTarget.dataset.date
    this.selectionInformation.amount = clickedTarget.dataset.length
  }

  focusNav() {
    let self = this;
    let noBullets = document.querySelector('.nobull')
    let navElements = [...noBullets.querySelectorAll('h3')].concat([...noBullets.querySelectorAll('ul')])
    navElements.forEach(function(element) {
      if (element.tagName === 'UL' && element.children[0] === self.selector) {
        element.classList.add('focus')
      } else if (element === self.selector) {
        element.classList.add('focus')
      } else {
        element.classList.remove('focus')
      }
    })
  }

  buildForm() {
    let selectDay = document.querySelector('select[name="day"]')
    days.forEach(function(day) {
      let option = document.createElement('option')
      option.value = day
      option.textContent = day
      selectDay.appendChild(option)
    })
    let selectMonth = document.querySelector('select[name="month"]')
    let monthsArray = Object.keys(months)
    monthsArray.forEach(function(month) {
      let option = document.createElement('option')
      option.value = months[month]
      option.textContent = month
      selectMonth.appendChild(option)
    })
    let selectYear = document.querySelector('select[name="year"]')
    years.forEach(function(year) {
      let option = document.createElement('option')
      option.value = year
      option.textContent = year
      selectYear.appendChild(option)
    })
  }

  showForm() {
    let form = document.querySelector('#addNewTodo')
    let addNew = document.querySelector('#addNew');
    document.addEventListener('click', function(event) {
      event.preventDefault()
      let target = event.target
      if (target === addNew) {
        $(form).show()

      }
      if (target === form) {
        $(form).hide()
      }
    })
  }

  addTodo(handler) {
    let self = this
    let form = document.querySelector('#addNewTodo')
    form.addEventListener('click', function(event) {
      event.preventDefault()
      let target = event.target
      let formData;
      let json;
      if (target.tagName === 'INPUT' && target.value === 'Save') {
        formData = new FormData(form)
        json = JSON.stringify(Object.fromEntries(formData))
        handler(json);
        form.reset()
        $(form).hide()
        self.selector = document.querySelector('h3')
      } else if (target.tagName === 'INPUT' && target.value === 'Mark As Complete') {
        alert('Cannot mark as complete as item has not been created yet!')
      }
    })
    
  }



  listenToNavForSelection() {
    let self = this
    let nav = document.querySelector('.nobull');
    nav.addEventListener('click', function(event) {
      event.preventDefault()
      let target = event.target;
      if (target.tagName === 'H3' || target.tagName === 'P') {
        self.getSelectorData(target)
        self.selector = target;
        self.displaySelection(self.localTodos)
        self.focusNav()
        self.changeTitle()
      }
    })
  }

  editShownItems(getTodo, updateTodo) {
    let self = this
    let returnedData;

    this.currentSelection.addEventListener('click', function(event) {
      event.preventDefault()
      let target = event.target;
      let toFill = document.querySelector('#formHolder')
      if (target.tagName === 'LABEL') {
        let data = getTodo(target.getAttribute('id'))
        let object = {id: data.id, title: data.title, completed: data.completed, day: data.day, month: data.month, year: data.year, description: data.description}
        let compiledHTML = self.itemEditorTemplate(object)
        toFill.insertAdjacentHTML('beforeend', compiledHTML);

        let editForm = document.querySelector('#formHolder').lastElementChild
        
        editForm.addEventListener('click', function(event) {
          event.preventDefault();
          let target = event.target;
          let id = editForm.getAttribute('id')
          let completionStatus = editForm.getAttribute('completion')
          let formData;
          let json;
          if (target.tagName === 'INPUT' && target.value === 'Save') {
            formData = self.sanitizeData(new FormData(editForm))
            formData.set('completed', completionStatus)
            json = JSON.stringify(Object.fromEntries(formData))
            updateTodo(id, json);
            editForm.remove()
          } else if (target.tagName === 'INPUT' && target.value === 'Mark As Complete') {
            formData = self.sanitizeData(new FormData(editForm))
            formData.set('completed', true);
            json = JSON.stringify(Object.fromEntries(formData))
            updateTodo(id, json);
            editForm.remove()
          }
        })
        document.addEventListener('click', function(event) {
          event.preventDefault()
          let target = event.target
          if (target === editForm) {
            $(editForm).remove()
          }
        })
      }
    })
  }

  markCompleted(handler) {
    this.currentSelection.addEventListener('click', function(event) {
      let target = event.target;
      let newCompletedStatus;
      if (target.tagName === 'INPUT' && (target.tagName !== 'LABEL' || target.tagName !== 'LI')) {
        let id = target.id
        let completed = target.nextElementSibling.getAttribute('completionstatus');        
        if (completed === 'true') {
          newCompletedStatus = 'false'
        } else {
          newCompletedStatus = 'true'
        }
        let json = JSON.stringify({completed: newCompletedStatus})
        handler(id, json)
      } else if (target.tagName === 'DIV') {
        let id = target.id
        let completed = target.querySelector('label').getAttribute('completionstatus');        
        if (completed === 'true') {
          newCompletedStatus = 'false'
        } else {
          newCompletedStatus = 'true'
        }
        let json = JSON.stringify({completed: newCompletedStatus})
        handler(id, json)
      }
      

    })
  }

  sanitizeData(formData) {
    if (formData.get('day').length === 1) {
      formData.set('day', ('0' + formData.get('day')))
    }
    if (formData.get('month').length === 1) {
      formData.set('month', ('0' + formData.get('month')))
    }
    return formData
  }
  
  deleteTodo(handler) {
    let self = this
    this.currentSelection.addEventListener('click', function(event) {
      event.preventDefault()
      let target = event.target
      if (target.tagName === 'LI' && $(target).attr('class') === 'fa') {
        let id = target.previousElementSibling.id
        handler(id)
      }
    })
  }

  updateNavAllTodos(allTodos) {
    let template = this.navAllTodosElementTemplate
    let toFill = this.allTodosNav
    $(toFill).empty()
    let allTodosKeys = Object.keys(allTodos)
    
    allTodosKeys.forEach(function(date) {
      let length = allTodos[date].length
      let object = {date: date, length: length}
      let compiledHTML = template(object)
      toFill.insertAdjacentHTML('beforeend', compiledHTML);
    })
    let amountAllTodos = Object.values(allTodos).flat().length
    let number = [...document.querySelectorAll('i')][0]
    document.querySelector('.all').dataset.length = amountAllTodos
    number.textContent = amountAllTodos;
  }

  updateNavAllCompleted(allCompleted) {
    let template = this.navCompletedElementTemplate
    let toFill = this.allCompletedNav
    $(toFill).empty()
    let completedKeys = Object.keys(allCompleted)
    
    completedKeys.forEach(function(date) {
      let length = allCompleted[date].length
      let object = {date: date, length: length}
      let compiledHTML = template(object)
      toFill.insertAdjacentHTML('beforeend', compiledHTML);
    })

    let amountAllCompleted = Object.values(allCompleted).flat().length
    let number = [...document.querySelectorAll('i')][1]
    document.querySelector('.completed').dataset.length = amountAllCompleted
    number.textContent = amountAllCompleted;
  }

  displaySelection(allTodos) {

    if (!allTodos) {
      allTodos = this.localTodos
    }
    let date = this.selector.textContent.slice(0, 7);
    if (date === 'No Due ') {
      date = 'No Due Date'
    }

    let result = []
    
    if (this.selector.tagName === 'H3') {
      if (this.selector.classList.contains('all')) {
        result = this.localTodos
      } else if (this.selector.classList.contains('completed')) {
        result = this.localTodos.filter(element => element.completed === true)
      }
    }
    
    if (this.selector.tagName === 'P') {
      if (this.selector.classList.contains('all') && date === 'No Due Date') {
        result = allTodos.filter(function(element) {
          if (date === 'No Due Date' && element.month === '' || element.day === '') {
            return true
          }
        })
      } else if (this.selector.classList.contains('all') && date !== 'No Due Date') {
        result = allTodos.filter(function(element) {
          if (date === `${element.month}/${element.year}`) {
            return true
          }
        })
      }
      else if (this.selector.classList.contains('completed') && date === 'No Due Date') {
        result = allTodos.filter(function(element) {
          if ((element.month === '' || element.day === '') && element.completed === true) {
            return true
          }
        })
      } else if (this.selector.classList.contains('completed') && date !== 'No Due Date') {
        result = allTodos.filter(function(element) {
          if (date === `${element.month}/${element.year}` && element.completed === true) {
            return true
          }
        })
      }
    }
    this.fillMainDisplay(result)
    if (this.allTodosForm.children.length === 0 && this.selector !== document.querySelector('h3')) {
      this.selector = document.querySelector('h3')
      this.changeTitle()
      this.displaySelection(allTodos)
      this.focusNav()
    }
  }

  fillMainDisplay(todosToDisplay) {
    $(this.allTodosForm).empty();
    let toFill = this.allTodosForm
    let template = this.todoListerTemplate
    todosToDisplay.forEach(function(element) {
      let date;
      if (element.month === '' || element.year === '') {
        date = 'No Due Date';
      } else {
        date = `${element.month}` + "/" + `${element.year}`;
      }
      let object = {id: element.id, title: element.title, date: date, completed: element.completed};
      let compiledHTML = template(object);
      toFill.insertAdjacentHTML('beforeend', compiledHTML)
    })
    this.strokeThrough()
  }

  strokeThrough() {
    let completedItems = [...this.currentSelection.querySelectorAll('[completionStatus="true"]')]
    completedItems.forEach(function(element) {
      element.style.textDecoration = 'line-through'
    })
    let allCompleted = document.querySelector('#allCompleted');
    let allP = allCompleted.querySelectorAll('p');
    allP.forEach(function(element) {
      element.style.textDecoration = 'line-through'
    })
  }

  returnSearchedTodos(searchItem) {
    let result;
    let type = searchItem.tagName;
    if (type === 'H3' || type === 'LI') {
      if ($(searchItem).hasClass('all')) {
        result = [...this.todos]
      } else if ($(searchItem).hasClass('completed')) {
        result = Object.values(this.allCompleted).flat()
      }
    } else if (type === 'P' || type === 'UL') {
      if ($(searchItem).hasClass('all')) {
        let date = searchItem.textContent.slice(0, 7);
        if (date === 'No Due ') {
          date = 'No Due Date'
        }
        result = this.allTodosPerDate[date]
      } else if ($(searchItem).hasClass('completed')) {
        let date = searchItem.textContent.slice(0, 7);
        if (date === 'No Due ') {
          date = 'No Due Date'
        }
        result = this.allCompleted[date]
      }
    }
    return result
  }

}


class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view

    this.getTodos()
    this.model.bindTodoListChanged(this.onTodoListChanged)
    this.model.bindSelectionChanged(this.onSelectionChanged)
    this.view.editShownItems(this.getTodo, this.updateTodo)
    this.view.deleteTodo(this.deleteTodo)
    this.view.showForm()
    this.view.markCompleted(this.updateTodo)
    this.view.buildForm()
    this.view.addTodo(this.addTodo)
  }

  onTodoListChanged = (todos) => {
    this.view.displayPage(todos)
  }

  onSelectionChanged = (todos) => {
    this.view.displaySelection(todos)
  }

  getTodos() {
    fetch('/api/todos')
    .then(response => response.json())
    .then(data => {
      this.model.assignTodos(data)
    })
  }

  addTodo = (data) => {
    let self = this
    fetch('/api/todos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: data
    })
    .then(response => {
      if (response.status === 201) {
        console.log('successfully added')
        self.getTodos()
      } else {
        alert('The inputs are not correct')
      }
    })
  }
  
  updateTodo = (id, data) => {
    let self = this;
    fetch(`api/todos/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: data
    })
    .then(response => {
      self.getTodos()
    })
  }

  deleteTodo = (id) => {
    let self = this;
    fetch(`api/todos/${id}`, {
      method: 'DELETE',
    })
    .then(response => {
      self.getTodos()
    })
  }

  resetDataBase = () => {
    let self = this
    fetch('/api/reset')
    .then(() => {
      self.getTodos()
    })
  }

  getTodo = (id) => {
    return this.model.returnTodo(id)
  }
  
}

let app;

document.addEventListener('DOMContentLoaded', function(event) {
  app = new Controller(new Model(), new View())
})

