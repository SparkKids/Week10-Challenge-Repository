import express from 'express';
import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';
//const Database = require('./db');
//const db = new Database();

await connectToDb();
console.log("After call to connectToDb");
//const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

inquirer
  .prompt([
    {
      type: 'list',
      name: 'userChoice',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'Add An Employee', 'Update Employee Role', 'View All Roles', 'Add A Role', 'View All Departments', 'Add A Department'],
    },

  ])
  .then(async (data) => {
    switch (data.userChoice) {
      case 'View All Employees':
        console.log("case View All Employees");
        getEmployees();
        break;
      case 'View All Departments':
        console.log("case View All Departments");
        getDepartments();
        break;
        case 'View All Roles':
          console.log("case View All Roles");
          getRoles();
          break;
  
    }
  });


function getEmployees() {
  console.log("getEmployees");
  const sql = `SELECT e.id, e.first_name, e.last_name, title, e2.first_name || ' ' || e2.last_name AS manager, d.name AS department, r.salary
FROM employee e INNER JOIN role r
on e.role_id = r.id
INNER JOIN department d
ON d.id = r.department_id
LEFT OUTER JOIN employee e2
ON e.manager_id = e2.id`;
  console.log("Before pool.query")
  pool.query(sql, (err: Error, result: QueryResult) => {
    console.log("pool.query")
    if (err) {
      console.log("pool.query error")
      console.log(err);
    } else if (result) {
      console.log("result")
      console.log(result.rows);
      console.table(result.rows);
    }

  });
  console.log("After pool.query")

}
function getDepartments() {
  console.log("getDepartments");
  const sql = `SELECT id, name FROM department
ORDER BY name`;
  console.log("Before pool.query")
  pool.query(sql, (err: Error, result: QueryResult) => {
    console.log("pool.query")
    if (err) {
      console.log("pool.query error")
      console.log(err);
    } else if (result) {
      console.log("result")
      console.log(result.rows);
      console.table(result.rows);
    }
  })
}
function getRoles() {
  console.log("getRoles");
  const sql = `SELECT r.id, r.title, d.name AS department, r.salary 
FROM role r INNER JOIN department d
ON r.department_id = d.id
ORDER BY r.title`;
  console.log("Before pool.query")
  pool.query(sql, (err: Error, result: QueryResult) => {
    console.log("pool.query")
    if (err) {
      console.log("pool.query error")
      console.log(err);
    } else if (result) {
      console.log("result")
      console.log(result.rows);
      console.table(result.rows);
    }
  })
}
// Default response for any other request (Not Found)
app.use((_req, res) => {
  res.status(404).end();
});


