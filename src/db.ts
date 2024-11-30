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
//Define the structure of the department 
//record returned by selectDepartment
interface Department {
    id: number;
    name: string;
}
// Define the structure of the empolyee row
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
// 'C'  addDepartment()
//
// 'R'  displayDepartments()
//      selectDepartment()
//
//////////////////////////////////////

//Prompt for new department and add it 
//into the department table 
export async function addDepartment() {

    try {
        const data = await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentName',
                message: 'What is the department\'s name?',
            }
        ]);

        const sql = `INSERT INTO department (name) VALUES ($1)`;
        const result = await pool.query(sql, [data.departmentName]);

        console.log(`${result.rowCount} row(s) inserted!`);
    } catch (err) {
        console.error(err);
    }
}//export async function addDepartment() 

export async function displayDepartments() {
    const sql = `SELECT id, name FROM department ORDER BY name`;

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else if (result) {
                console.log("View All Departments");
                console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result
            }
        });
    });
}
export async function displayDeptUtilizedBudget() {
    const promptString = 'Select A Deparment To Display Utilized Budget';
    const department = await selectDepartment(promptString);
    console.log("department: " + department.name);
    const sql = `SELECT d.name, SUM(r.salary) AS total_budget
FROM employee e JOIN role r 
ON e.role_id = r.id
JOIN department d
ON d.id = r.department_id
WHERE d.id = $1
GROUP BY d.name`;

    return new Promise((resolve, reject) => {
        pool.query(sql, [department.id], (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                // Iterate over result.rows to format the output
                result.rows.forEach(row => {
                    // Ensure total_budget is treated as a number
                    const totalBudget = Number(row.total_budget);
                    const formattedBudget = totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
                    console.log(`The ${row.name} department has a total utilized budget of ${formattedBudget}`);
                }); resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });

}//export async function displayDeptUtilizedBudget()

async function selectDepartment(selectPrompt: string): Promise<Department> {
    const sql = `SELECT id, name FROM department ORDER BY name`;

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, results: QueryResult) => {
            if (err) {
                console.log(err);
                reject(err);
            } else if (results) {
                const choices = results.rows.map(result => ({
                    name: result.name, // Display name
                    value: result.id   // Value to return
                }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'selectedDepartment',
                        message: selectPrompt,
                        choices: choices
                    }
                ]).then(answers => {
                    // Find the selected department name using the selected ID
                    const selectedDept = choices.find(choice => choice.value === answers.selectedDepartment) || { name: 'unknown' };
                    console.log(`You selected department: ${selectedDept.name}`); // Display department name
                    // Resolve with an object containing both the selected department ID and name
                    resolve({
                        id: answers.selectedDepartment,
                        name: selectedDept.name
                    });
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            }
        });
    });
}//async function selectDepartment(selectPrompt: string)

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
//  'U' updateEmployeeManagerID() - Assigns a new manager to 
//                                  an employee
//
//      updateEmployeeRoleID()    - Assigns a new role to an employee  
//
//////////////////////////////////////
export async function addEmployee() {
    const firstName = await promptForFirstName();
    const lastName = await promptForLastName();
    const roleID = await selectRoleID();
    const managerID = await selectManager();

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
    return new Promise((resolve, reject) => {
        pool.query(
            sql,
            [firstName, lastName, roleID, managerID],
            (err: Error, result: QueryResult) => {
                if (err) {
                    console.error(err);
                    reject(err); // Reject the promise if there's an error
                } else {
                    console.log(`${result.rowCount} row(s) inserted!`);
                    resolve(result.rowCount);
                }
            });
    });
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
    return data.lastName;
}//async function promptForLastName()

export async function displayEmployeesByDepartment() {
    const sql = `SELECT e.first_name || ' ' || e.last_name AS "Employee Name", d.name AS "Department" 
FROM employee e
JOIN role r
ON e.role_id = r.id
JOIN department d
on r.department_id = d.id
order by "Department", e.last_name, e.first_name
`;

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                // Iterate over result.rows to format the output
                console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });

}//export async function displayEmployeesByDepartment()

export async function displayEmployeesByManager() {
    const sql = `SELECT e.first_name || ' ' || e.last_name AS "Employee Name", COALESCE(m.first_name || ' ' || m.last_name, 'No Manager') AS Manager 
FROM employee e
LEFT OUTER JOIN employee m
on m.id = e.manager_id
order by m.last_name, m.first_name, e.last_name, e.first_name`;

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                // Iterate over result.rows to format the output
                console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });

}//export async function displayEmployeesByManager()


export async function updateEmployeeManagerID() {
    const id = await selectEmployeeForManagerChange();
    const manager_id = await selectManager();
    const values = [manager_id, id]
    const sql = `UPDATE employee 
        SET manager_id = $1
        WHERE id = $2`;

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                //console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });

    });
}//export async function updateEmployeeManagerID()

export async function updateEmployeeRoleID() {
    const id = await selectEmployeeForRoleChange();
    const role_id = await selectRoleID();
    const values = [role_id, id]
    const sql = `UPDATE employee 
        SET role_id = $1
        WHERE id = $2`;

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.table(result.rows);
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}//export async function updateEmployeeRoleID()

async function getEmployees(): Promise<EmployeeID[]> {
    const sql = `SELECT e.id, e.first_name || ' ' || e.last_name || ' - ' || title || ' - Dept - ' || d.name AS "employeeName"
FROM employee e INNER JOIN role r
on e.role_id = r.id
INNER JOIN department d
ON d.id = r.department_id
ORDER BY d.name, e.last_name,e.first_name`;

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}//async function getEmployees(): Promise<EmployeeID[]> {

//Need to select an employee for the employee.role_id change
async function selectEmployeeForManagerChange() {
    // Get the employees from the database
    const employees = await getEmployees();
    const employeeChoices = employees.map(employee => ({
        name: employee.employeeName,
        value: employee.id // Return the id as the value
    }));

    return inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Please select an employee for a new manager:',
            choices: employeeChoices
        }
    ]).then(answers => {
        return answers.employeeId; // This will return the selected manager's id
    });

} //async function selectEmployeeForRoleChange()

//Need to select an employee for the employee.role_id change
async function selectEmployeeForRoleChange() {
    // Get the employees from the database
    const employees = await getEmployees();
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
    // Get the employees from the database
    const managers = await getEmployees();
    const managerChoices = managers.map(manager => ({
        name: manager.employeeName,
        value: manager.id // Return the id as the value
    }));
    // Add the 'No Manager' option
    managerChoices.push({
        name: 'No Manager',
        value: 0
    });
    return inquirer.prompt([
        {
            type: 'list',
            name: 'managerId',
            message: 'Please select a manager:',
            choices: managerChoices
        }
    ]).then(answers => {
        if (answers.managerId === 0) {//User has selected 'No Manager'
            //set employee.manager_id to null
            answers.managerId = null;
        }
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
ON e.manager_id = e2.id
ORDER BY d.name, e.last_name,e.first_name`;
    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
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
    console.log("View All Employees");
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
//      displayRoles()
//      getRoles()
//      selectRoleID()
//
//////////////////////////////////////
export async function addRole() {
    const roleTitle = await promptForRoleTitle();
    console.log("RoleTitle: " + roleTitle);
    const salary = await promptForSalary();
    console.log("salary: " + salary);
    const department = await selectDepartment('Select Department for new role:');


    const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
    return new Promise((resolve, reject) => {
        pool.query(
            sql,
            [roleTitle, salary, department.id],
            (err: Error, result: QueryResult) => {
                if (err) {
                    console.error("Error executing query:" + err);
                    reject(err); // Reject the promise if there's an error
                } else {
                    console.log(`${result.rowCount} row(s) inserted!`);
                    resolve(result);
                }
            });
    });
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
    return data.roleTitle;
}//async function promptForRoleTitle() {


async function getRoles(): Promise<Role[]> {
    const sql = `SELECT r.id, r.title, d.name AS department, r.salary 
FROM role r INNER JOIN department d
ON r.department_id = d.id
ORDER BY r.title`;

    return new Promise((resolve, reject) => {
        pool.query(sql, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
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
    return data.salary;
}//async function promptForSalary()

export async function displayRoles() {
    const result = await getRoles();
    console.log("View All Roles")
    console.table(result);
}
