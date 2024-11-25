import express from 'express';
//import { QueryResult } from 'pg';
import { /* pool, */ connectToDb } from './connection.js';
import inquirer from 'inquirer';
import { addDepartment, addEmployee, addRole, displayEmployees, displayDepartments, getRoles, updateEmployeeRoleID } from './db.js'; // Import the functions

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
    }

  ])
  .then(async (data) => {
    switch (data.userChoice) {
      case 'View All Employees':
        displayEmployees();
        break;
        case 'Add An Employee':
          console.log("case Add An Employee");
          addEmployee();
          break;
          case 'Update Employee Role':
            console.log("case Update Employee Role");
            updateEmployeeRoleID();
            break;
            case 'View All Departments':
        console.log("case View All Departments");
        displayDepartments();
        break;
      case 'View All Roles':
        console.log("case View All Roles");
        await viewAllRoles();
        break;
      case 'Add A Role':
        console.log("case Add A Role");
        addRole();
        break;
      case 'Add A Department':
        console.log("case Add A Department");
        addDepartment();
        break;

    }
  });



// Default response for any other request (Not Found)
app.use((_req, res) => {
  res.status(404).end();
});

async function viewAllRoles() {
  console.log("viewAllRoles");
  const result = await getRoles();
  console.table(result);
}


