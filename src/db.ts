// db.ts
import { QueryResult } from 'pg';
import { pool } from './connection.js';
import inquirer from 'inquirer';
// Define the structure of the employee row
interface Employee {
    //e.id, e.first_name, e.last_name, title, e2.first_name || ' ' || e2.last_name AS manager, d.name AS department, r.salary
    id: number;
    first_name: string;
    last_name: string;
    title: string;
    manager: string;
    department: string;
    salary: string;
}
// Define the structure of the emp0lyee row
interface EmployeeID {
    id: number;
    employeeName: string;
}
// Define the structure of the role row
interface Role {
    id: number;
    title: string; // Change this to title since you're selecting title from the database
    department: string;
    salary: number;
}
//////////////////////////////////////
//
// CRUD operations for department table
//
// 'C' addDepartment()
//
// 'R' displayDepartments()
//
//////////////////////////////////////

//Prompt for new department and add it 
//into the department table 
export function addDepartment() {
    console.log("addDepartment");

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'What is the department\'s name?',
            }

        ])
        .then(async (data) => {
            console.log("data.departmentName " + data.departmentName);
            const sql = `INSERT INTO department (name) VALUES ($1)`;
            pool.query(
                sql,
                [data.departmentName],
                (err: Error, result: QueryResult) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`${result.rowCount} row(s) inserted!`);
                    }
                });
        })

}//export function addDepartment() {

export function displayDepartments() {
    console.log("getDepartments");
    const sql = `SELECT id, name FROM department ORDER BY name`;
    console.log("Before pool.query");
    pool.query(sql, (err: Error, result: QueryResult) => {
        console.log("pool.query");
        if (err) {
            console.log("pool.query error");
            console.log(err);
        } else if (result) {
            console.log("result");
            console.log(result.rows);
            console.table(result.rows);
        }
    });
}//export function displayDepartments() {

async function selectDepartment() {
    const sql = `SELECT id, name FROM department ORDER BY name`;
    console.log("Before pool.query");

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, results: QueryResult) => {
            console.log("pool.query");
            if (err) {
                console.log("pool.query error");
                console.log(err);
                return reject(err);
            } else if (results) {
                console.log("results");
                console.log(results.rows);
                console.table(results.rows);
                const choices = results.rows.map(result => ({
                    name: result.name, // Display name
                    value: result.id   // Value to return
                }));
                console.log("Choices:" + choices);
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'selectedDepartment',
                        message: 'Choose a department:',
                        choices: choices
                    }
                ]).then(answers => {
                    console.log(`You selected department id: ${answers.selectedDepartment}`);
                    resolve(answers.selectedDepartment); // Resolve with the selected department ID
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            }
        });
    });
}

//////////////////////////////////////
//
// CRUD operations for employee table
//
// 'C'  addEmployee()
//          promptForFirstName() - employee.first_name
//          promptForLastName() - employee.last_name
//          selectManager() - employee.mgr_id
//
// 'R'  getEmployees() - Used by inquirer to allow user to select 
//                      from a list of employee names, titles, etc.
//                      to return the id of the selected employee
//      getEmployeesDetails() - Selects a list of employees details
//                              to display to the user
//
//////////////////////////////////////
export async function addEmployee() {
    console.log("addEmployee");
    const firstName = await promptForFirstName();
    console.log("firstName: " + firstName);
    const lastName = await promptForLastName();
    console.log("lastName: " + promptForLastName);
    const roleID = await selectRoleID();
    console.log("roleID: " + roleID);
    const managerID = await selectManager();
    console.log("managerID: " + managerID);

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
    console.log("Before pool.query INSERT INTO employee");
    pool.query(
        sql,
        [firstName, lastName, roleID, managerID],
        (err: Error, result: QueryResult) => {
            console.log("Before if (err)");
            if (err) {
                console.log("Error executing query:", err);
            } else {
                console.log(`${result.rowCount} row(s) inserted!`);
                console.log("Result:", result);
            }
            console.log("After if (err)");
        });
    console.log("After pool.query INSERT INTO employee");
}//export async function addEmployee

async function promptForFirstName() {
    const data = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'What is the first name of the employee?',
            }

        ])
    console.log("data.firstName " + data.firstName);
    return data.firstName;
}//async function promptForFirstName()

async function promptForLastName() {
    const data = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'lastName',
                message: 'What is the last name of the employee?',
            }

        ])
    console.log("data.lastName " + data.lastName);
    return data.lastName;
}//async function promptForLastName()

export async function updateEmployeeRoleID() {
    const id = await selectEmployeeForRoleChange();
    console.log("id: " + id);
    const role_id = await selectRoleID();
    console.log("role_id: " + role_id);
    const values = [role_id, id]
    const sql = `UPDATE employee 
        SET role_id = $1
        WHERE id = $2`;
    console.log("Before pool.query");

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err: Error, result: QueryResult) => {
            console.log("pool.query");
            if (err) {
                console.log("pool.query error");
                console.log(err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}

async function getEmployees(): Promise<EmployeeID[]> {
    console.log("getEmployees");
    const sql = `SELECT e.id, e.first_name || ' ' || e.last_name || ' - ' || title || ' - Dept - ' || d.name AS "employeeName"
FROM employee e INNER JOIN role r
on e.role_id = r.id
INNER JOIN department d
ON d.id = r.department_id
ORDER BY r.title`;
    console.log("Before pool.query");

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            console.log("pool.query");
            if (err) {
                console.log("pool.query error");
                console.log(err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}//async function getEmployees(): Promise<EmployeeID[]> {

//Need to select an employee for the employee.role_id change
async function selectEmployeeForRoleChange() {
    console.log("async function selectEmployeeForRoleChange() Start");
    // Get the employees from the database
    const employees = await getEmployees();
    console.log("After getEmployees");
    console.table(employees);
    const employeeChoices = employees.map(employee => ({
        name: employee.employeeName,
        value: employee.id // Return the id as the value
    }));

    return inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Please select an employee for a new role:',
            choices: employeeChoices
        }
    ]).then(answers => {
        return answers.employeeId; // This will return the selected manager's id
    });

} //async function selectEmployeeForRoleChange()

//Need to select an employee for the employee.manager_id
async function selectManager() {
    console.log("selectManager() Start");
    // Get the employees from the database
    const managers = await getEmployees();
    console.log("After getEmployees");
    console.table(managers);
    const managerChoices = managers.map(manager => ({
        name: manager.employeeName,
        value: manager.id // Return the id as the value
    }));

    return inquirer.prompt([
        {
            type: 'list',
            name: 'managerId',
            message: 'Please select a manager:',
            choices: managerChoices
        }
    ]).then(answers => {
        return answers.managerId; // This will return the selected manager's id
    });

} //async function selectManager()

async function getEmployeesDetails(): Promise<Employee[]> {
    const sql = `SELECT e.id, e.first_name, e.last_name, title, e2.first_name || ' ' || e2.last_name AS manager, d.name AS department, r.salary
FROM employee e INNER JOIN role r
on e.role_id = r.id
INNER JOIN department d
ON d.id = r.department_id
LEFT OUTER JOIN employee e2
ON e.manager_id = e2.id`;
    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.log(err);
                reject(err); // Reject the promise if there's an error
            } else if (result) {
                resolve(result.rows);
            }
        });
    });
}//async function getEmployeesDetails() {

//Display a list of employees to the console
export async function displayEmployees() {
    const employeeDetails = await getEmployeesDetails();
    console.table(employeeDetails);

}//export async function displayEmployees()

//////////////////////////////////////
//
// CRUD operations for role table
//
//  'C'
//      addRole()
//          promptForRoleTitle() - used to create role.title
//          promptForSalary() - used to create role.salary
//
//  'R'
//      getRoles()
//      selectRoleID()
//
//////////////////////////////////////
export async function addRole() {
    console.log("addRole");
    const roleTitle = await promptForRoleTitle();
    console.log("roleTitle: " + roleTitle);
    const salary = await promptForSalary();
    console.log("salary: " + salary);
    const departmentID = await selectDepartment();
    console.log("after selectDepartment departmentID: " + departmentID);

    const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
    console.log("Before pool.query INSERT INTO role");
    pool.query(
        sql,
        [roleTitle, salary, departmentID],
        (err: Error, result: QueryResult) => {
            console.log("Before if (err)");
            if (err) {
                console.log("Error executing query:", err);
            } else {
                console.log(`${result.rowCount} row(s) inserted!`);
                console.log("Result:", result);
            }
            console.log("After if (err)");
        });
    console.log("After pool.query INSERT INTO role");
}//export async function addRole()

async function promptForRoleTitle() {
    const data = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'roleTitle',
                message: 'What is the title for the role?',
            }

        ])
    console.log("data.roleTitle " + data.roleTitle);
    return data.roleTitle;
}//async function promptForRoleTitle() {


export async function getRoles(): Promise<Role[]> {
    console.log("getRoles");
    const sql = `SELECT r.id, r.title, d.name AS department, r.salary 
FROM role r INNER JOIN department d
ON r.department_id = d.id
ORDER BY r.title`;
    console.log("Before pool.query");

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            console.log("pool.query");
            if (err) {
                console.log("pool.query error");
                console.log(err);
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}//export async function getRoles(): Promise<Role[]>

async function selectRoleID() {
    const results = await getRoles(); // Get the roles from the database
    const choices = results.map((result: Role) => ({
        name: result.title, // Use the title for display
        value: result.id    // Use the id as the value to return
    }));

    const { roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'roleId',
            message: 'Select a role:',
            choices: choices
        }
    ]);

    return roleId; // Return the selected role ID
}//async function selectRoleID()

async function promptForSalary() {
    const data = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?',
            }

        ])
    console.log("data.salary " + data.salary);
    return data.salary;
}//async function promptForSalary() {
