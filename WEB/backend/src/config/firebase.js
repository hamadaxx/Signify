const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with service account directly
const serviceAccount = {
    type: "service_account",
    project_id: "signify-68c4d",
    private_key_id: "dfe6959399fa407e93afd8419c803fede4b955de",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDO5sAcMkw79x7O\n0H7y+8YkdZnTjiw39dmQNMl69DVbVFMraTXm61cgbfCzGhpqGQciAKZ68+wEJsyp\nW/5BuigLku3WtxNpTqkSeM/H0oNdueVXyTjdJOwoEumsWWST2SGRsPzWhSy8pDlt\n6FSCEBpAdV6nV8H17zjiBIs6iMtxIbhTGfsGXZWeJZ0cYTydWkqDmlaUngJLkPFi\n1TqKdr73gjmgmyVeFgLNsEgKuEIZ6Rcg8lBRl+W0TSKVwIEjE6divaGIFtgX9Xg8\nuT0t2Ts2TsiqeuOjTUWXPLqVqNudW0/aqkwW8QRao7t7kqgNhSW+zCChfh4uCsA9\nrQfcu9AVAgMBAAECggEAJgjx7o0JiimE8piOCd2igH/U+jjj5JqvtuyZUF7V8zbm\nfi++bre7QdUsH0Swb+ovbz8G28n9DItUatrkPBF8fJozWlo3+Y8yEhj++3k12JRM\ntq1hZHf96OUHK32YeXx8SRPr+wSq43feLdf8txc+ODTLZICDwdILFzOmI6nTmnV3\nllrEait9LQEF7k2kDZV7JW6/XRRlL+p6qI2FXdPye4q2Ulew5EHKyyVrdK/DStOe\nfLQpUdMjW2R65LMm0OgaUi3Nn2ck/umIM6W+hNkV3DMBFr1QSW7g9cO99UvOyJ0K\nYnsYO6HWPlGyYbxxaqc3Hwls6TULqdQYyBM4R51EuQKBgQDn0m0ZcyY+P6ILa/jj\nTpqlNZq1kQsy+VzK1lg45CYxfqPZuj3DVMmXWEVq0aE3vvssB7FZ15be7Ls+4trz\nuEoDpm5VweuRSLHH9zyF0bxdmLa/MNjF1I7TlhvgTyupj3TbiQymPYQaDOdm+Ap5\ntBSEeuuC9OK0LAdwfVYnR5BXOQKBgQDkevOtJnz7bQXLK7UbmghGRBqsIBxDNe29\nvQ3MHzPzUrZa/X/GQd6Wy/8Sfc8pXarCnkCFedGoufwYbID7SbylfOlPthwjlVAm\nB0LiWBmOnKVZO4kowDNwJbxV+sjcWVkFxCnB/Q7kXH6Euox8alR203L5Ky6C84gb\n15tT95PDvQKBgQDiNyTfQM6Az/eAzcwBhCLENJrTssYK5+r0xFUyru/WPI4HWQYM\nJiDR3wFeS1HW5DaVsKwPz6EZyEiwBQ9D5QHUrgPdC26kRxu01j3pF9GIRA2QZEok\nQlddgY2SRa+FtseBsyr0zfKquQzWHhWazW94F7rZ/715s71Ot//qNJtVgQKBgDDu\nD89OBcgGcg4vnwp5MzpxDVE9UzAllXNj0Fedew+p7/mOflWj95pNt6NrI/lU4OPq\n5iBvlTHQGqfUXM7z3J2IIaL7eg04xcBPH8i/W0HKVDLG6Dm854cl3a6AFZHy5Hiy\nqMqtegn3sPSVys4+KzaDVAT+dWh/5O8pfk8+Hvv1AoGBALJRUUa8L4DKgkeE0+OV\nIBvGTfVmWeGeQ0nK8F6ETtqwxzyhVKV9iLI55R9Vi3uqChK6PR4pCbBFRz/QH01N\n+62MzCqjKc7pfBtQtIix+OkkzdPIgmUgYBjP174QN4T0le5TYyy88y4oXIw+tpcx\nPQpgsF4DyVBKVyX8inu0Xfm/\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@signify-68c4d.iam.gserviceaccount.com",
    client_id: "104562354566571460457",
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };

