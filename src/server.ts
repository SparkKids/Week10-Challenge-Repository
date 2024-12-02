import express from 'express';
//import { QueryResult } from 'pg';
import { /* pool, */ connectToDb } from './connection.js';
import inquirer from 'inquirer';
import {
  addDepartment, addEmployee, addRole, deleteDepartment,
  deleteEmployee, deleteRole, displayEmployees,
  displayEmployeesByDepartment, displayEmployeesByManager,
  displayDepartments,
  displayDeptUtilizedBudget, displayRoles,
  updateEmployeeManagerID, updateEmployeeRoleID
} from './db.js'; // Import the functions

await connectToDb();
//const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

async function promptUser() {
  while (true) {
    const data = await inquirer.prompt([
      {
        type: 'list',
        name: 'userChoice',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'View Employees By Department', 'View Employees By Manager', 'Add An Employee','Delete An Employee' ,'Update Employee Role',
          'Update Employee Manager', 'View All Roles', 'Add A Role', 'Delete A Role', 'View All Departments',
          'View A Department\'s Total Utilized Budget', 'Add A Department', 'Delete A Department', 'Exit The Program'],
      }
    ]);

    switch (data.userChoice) {
      case 'View All Employees':
        await displayEmployees();
        break;
      case 'View Employees By Department':
        await displayEmployeesByDepartment();
        break;
      case 'View Employees By Manager':
        await displayEmployeesByManager();
        break;
      case 'Add An Employee':
        await addEmployee(); // Ensure this is awaited if it's an async function
        break;
        case 'Delete An Employee':
          await deleteEmployee(); // Ensure this is awaited if it's an async function
          break;
        case 'Update Employee Role':
        await updateEmployeeRoleID(); // Ensure this is awaited if it's an async function
        break;
      case 'Update Employee Manager':
        await updateEmployeeManagerID(); // Ensure this is awaited if it's an async function
        break;
      case 'View All Departments':
        await displayDepartments();
        break;
      case 'View A Department\'s Total Utilized Budget':
        await displayDeptUtilizedBudget();
        break;
      case 'View All Roles':
        await displayRoles(); // Ensure this is awaited if it's an async function
        break;
      case 'Add A Role':
        await addRole(); // Ensure this is awaited if it's an async function
        break;
      case 'Delete A Role':
        await deleteRole(); // Ensure this is awaited if it's an async function
        break;
      case 'Add A Department':
        await addDepartment(); // Ensure this is awaited if it's an async function
        break;
      case 'Delete A Department':
        await deleteDepartment();
        break;
      case 'Exit The Program':
        return; // Exit the program by breaking the loop
    }
  } // while (true)
} // async function promptUser()

await promptUser();
process.exit();




