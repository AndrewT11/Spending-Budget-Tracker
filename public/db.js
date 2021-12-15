let db;

// creating a new database request for a "BudgetDB" database.
const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  console.log("Upgrade needed in IndexedDB");

  const { oldVersion } = event;
  const newVersion = event.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = event.target.result;

  //if there is no databases listed, create BudgetStore db that autoIncrements its id
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

request.onsuccess = function (event) {
  db = event.target.result;

  //If browser is online, we will call checkDatabase() function below
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  //Error log
  console.log(`Error: ${event.target.errorCode}`);
};

//if off line, error will be thrown. sendTransaction() will have a catch error, which calls saveRecords() to place this transaction into the BudgetDB for use when we are back online.
function saveRecord(payment) {
  //will only show in offline mode
  console.log("Save record invoked");

  //Opening a transaction in BudgetStore of the DB
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  //Access BudgetStore objectStore
  const store = transaction.objectStore("BudgetStore");

  //Here, we add the payment offline to the BudgetStoreDB BudgetStore object store
  store.add(payment);
}
