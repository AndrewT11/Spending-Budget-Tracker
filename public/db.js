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
