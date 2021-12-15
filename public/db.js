let db;
let budgetVersion;

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
const saveRecord = (payment) => {
  //will only show in offline mode
  console.log("Save record invoked");

  //Opening a transaction in BudgetStore of the DB
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  //Access BudgetStore objectStore
  const store = transaction.objectStore("BudgetStore");

  //Here, we add the payment offline to the BudgetStoreDB BudgetStore object store
  store.add(payment);
};

//function that is called once browser is back online and ready to sync with server. Will add offline transactions with total transactions
function checkDatabase() {
  console.log("check db invoked");

  //Open a transaction in our BudgetDB
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  //Access to the BudgetStore object store
  const store = transaction.objectStore("BudgetStore");

  //grabbing everything inside the BudgetStore object store
  const getAll = store.GetAll();
}
//This is where we check to see if any transactions have been saved offline
getAll.onsuccess = function () {
  //if there are transactions = true...fetch those transaction at that end point.
  if (getAll.result.length > 0) {
    fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        //if our returned response is not empty
        if (result.length !== 0) {
          //open another transaction to BudgetStore with the ability to read and write
          const transaction = db.transaction(["BudgetStore"], "readwrite");

          // Assign the current store to a variable...again
          const currentStore = transaction.objectStore("BudgetStore");

          //Clear existing entries because buld add was successful and nothing needs to be stored in IndexedDB as we are currently online
          currentStore.clear();
          console.log();
        }
      });
  }
};

//Event Listener to listen for app coming back online
window.addEventListener("online", checkDatabase);
