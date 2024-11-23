// db.ts
import { QueryResult } from 'pg';
import { pool } from './connection.js';
import inquirer from 'inquirer';
// Define the structure of the manager row
interface Manager {
    id: number;
    manager: string;
}
// Define the structure of the role row
interface Role {
    id: number;
    title: string; // Change this to title since you're selecting title from the database
    department: string;
    salary: number;
}
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

}
export async function addEmployee() {
    console.log("addEmployee");
    const firstName = await getFirstName();
    console.log("firstName: " + firstName);
    const lastName = await getLastName();
    console.log("lastName: " + lastName);
    const roleID = await selectRoleID();
    console.log("roleID: " + roleID);
    const managerID = await selectManagerID();
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
    console.log("After pool.query INSERT INTO role");
}//export async function addEmployee
async function getFirstName() {
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
}
async function getLastName() {
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
}

export async function updateEmployeeRole(){

}

export async function addRole() {
    console.log("addRole");
    const roleName = await getRoleName();
    console.log("roleName: " + roleName);
    const salary = await getRoleSalary();
    console.log("salary: " + salary);
    const departmentID = await getRoleDepartmentID();
    console.log("after getRoleDepartmentID departmentID: " + departmentID);

    const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
    console.log("Before pool.query INSERT INTO role");
    pool.query(
        sql,
        [roleName, salary, departmentID],
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
}
async function getEmployeesList(): Promise<Manager[]> {
    console.log("getEmployeesList");
    const sql = `SELECT e.id, e.first_name || ' ' || e.last_name || ' - ' || title || ' - Dept - ' || d.name AS employeeName
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
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}
async function selectManagerID() {
    const results = await getEmployeesList(); // Get the roles from the database
    const choices = results.map(result => ({
        name: result.employeeName, // Display name
        value: result.id   // Value to return
    }));

    const { managerId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'managerId',
            message: 'Select a Manager:',
            choices: choices
        }
    ]);

    return managerId; // Return the selected role ID
} //async function selectManagerID()
export function getEmployees() {
    console.log("getEmployees");
    const sql = `SELECT e.id, e.first_name, e.last_name, title, e2.first_name || ' ' || e2.last_name AS manager, d.name AS department, r.salary
FROM employee e INNER JOIN role r
on e.role_id = r.id
INNER JOIN department d
ON d.id = r.department_id
LEFT OUTER JOIN employee e2
ON e.manager_id = e2.id`;
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
}
async function displayEmployees() {
    
}
async function getRoleName() {
    const data = await inquirer
        .prompt([
            {
                type: 'input',
                name: 'roleName',
                message: 'What is the name of the role?',
            }

        ])
    console.log("data.roleName " + data.roleName);
    return data.roleName;
}
export function getDepartments() {
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
}

// Update the return type of getRoles to be Promise<Role[]>
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
}//getRoles(): Promise<Role[]>
async function getRoleDepartmentID() {
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
}
async function getRoleSalary() {
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
}
