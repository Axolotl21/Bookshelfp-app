const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'GUA_TIDAK_PAHAM_COY';

function isStorageExist(){
  if (typeof (Storage) === undefined) {
    alert("Your storage doesn't support local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted
  }
}

function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function addBook() {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const year = document.getElementById('year').value;
  const isComplete = false;
  const generateIDBook = +new Date();

  const bookObject = generateBookObject(generateIDBook, title, author, year, isComplete);
  books.push(bookObject);
  showDialog('book is successfully made', 'auto_stories');
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const {id, title, author, year, isCompleted} = bookObject;
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title; 

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = author;

  const bookYear = document.createElement('p');
  bookYear.innerText = year;

  const bookData = document.createElement('div');
  bookData.append(bookAuthor, bookYear);

  const deleteButton = document.createElement('span');
  deleteButton.innerText = "delete";
  deleteButton.classList.add('button-action', 'action-delete', 'material-symbols-outlined');

  const textContainer = document.createElement('div');
  textContainer.classList.add('book');
  textContainer.append(bookTitle, bookData, deleteButton);
  textContainer.setAttribute('id', `${id}`);
  if (!isCompleted){
    const moveButton = document.createElement('span');
    moveButton.innerText = "check";
    moveButton.classList.add('button-action', 'action-move', 'material-symbols-outlined');
    textContainer.appendChild(moveButton);

    moveButton.addEventListener('click', ()=>{
      moveBookToCompleted(id);
      showDialog('Book is successfully moved to Have Read', 'check');
    });
  }else if(isCompleted){
    const undoButton = document.createElement('span');
    undoButton.innerText = "undo";
    undoButton.classList.add('button-action', 'action-move', 'material-symbols-outlined');
    textContainer.appendChild(undoButton);

    undoButton.addEventListener('click', ()=>{
      undoBookFromCompleted(id);
      showDialog('Book is successfully moved to Current Read', 'undo');
    });
  }

  deleteButton.addEventListener('click', function(){
    removeBookFromCompleted(id);
  });
  return textContainer;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showDialog('Book is successfully deleted', 'delete');
}

function moveBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', () => {
  const submitForm = document.getElementById('form-input');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function showDialog(textMessage, textIcon){
  const doneIcon = document.createElement('span');
  doneIcon.innerHTML = `${textIcon}`;
  doneIcon.classList.add('material-symbols-outlined', 'button-action', 'big');

  const textDialog = document.createElement('p');
  textDialog.innerHTML = `${textMessage}`;

  const customDialog = document.createElement('div');
  customDialog.classList.add('custom-dialog');
  customDialog.append(doneIcon, textDialog);

  setTimeout(()=> {
    customDialog.style.display = 'none';
  },875);

  const dialogContainer = document.getElementById('dialog-box');
  dialogContainer.append(customDialog);
  dialogContainer.style.display = 'block';

  setTimeout(()=> {
    dialogContainer.style.display = 'none';
  },875);

}

document.addEventListener(RENDER_EVENT, ()=> {
  const uncompletedBookList = document.getElementById('current-read');
  uncompletedBookList.innerHTML = '';
  const completeBookList = document.getElementById('have-read');
  completeBookList.innerHTML = '';
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if(bookItem.isCompleted) {
      completeBookList.append(bookElement);
    }else{
      uncompletedBookList.append(bookElement);
    }
  }
});

