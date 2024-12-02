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
    department: number;
    salary: number;
}
//////////////////////////////////////
//
// CRUD operations for department table
//
// 'C'  addDepartment()
//
// 'R'  displayDepartments() - Displays all departments ordered by
//          department.name
//
//      selectDepartment(selectPrompt: string): Promise<Department>
//          - Ask the user to select a department form a list using
//          the passed in prompt
//
//      getEmployees(): Promise<EmployeeID[]> - Used by inquirer to 
//          allow user to select from a list of employee names, 
//          titles, etc. to return the id of the selected employee
//
//      getEmployeesDetails() - Selects a list of employees details
//                              to display to the user
//
//      getRoles(): Promise<Role[]> - Retrieves a list of roles 
//          (id, title, department.name, salary)
//
//      chk_department_fk_role(departmentID: number): Promise<number>
//      Check if department.id is a foreign key in role table 
//      (role.department_id)
//
//      displayEmployeesByDepartment() - Retrieves employees and 
//          departments ordered by department name, employee last name,
//          employee first name
//
//      displayDeptUtilizedBudget() - Displays by department the total
//          amount spent on employee salaries.
//
// 'D'  deleteDepartment()
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

export async function deleteDepartment() {
    const promptString = 'Please Select The Department You Would Like To Delete';
    const department = await selectDepartment(promptString);
    console.log("department " + department.id + " " + department.name + " selected for deletion");

    //If department.id is a foreign key in the role table, Display
    //an error message and Reject deleting the department 
    const rowCount = await chk_department_fk_role(department.id);
    if (rowCount > 0) {
        console.log("Unable to delete Department: " + department.name);
        console.log("Department " + department.name + " is used in the role table.");
        return;
    }
    const sql = `DELETE FROM department
                WHERE id = $1`;
    return new Promise((resolve, reject) => {
        pool.query(sql, [department.id], (err: Error, result: QueryResult) => {
            if (err) {
                console.error("Unable to delete Department " + department.name + err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.log(department.name + " deleted.")
                resolve(result); // Resolve the promise with the rowCount
            }
        });
    });

}//export async function deleteDepartment()

//Displays all departments to the console ordered by department.name
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
}//export async function displayDepartments()

//Displays by department the total amount spent on employee salaries.
export async function displayDeptUtilizedBudget() {
    const promptString = 'Select A Deparment To Display Utilized Budget';
    const department = await selectDepartment(promptString);
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
                if (result.rowCount === 0) {
                    console.log("Department " + department.name + " has no budget");
                }
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

//Asks the user to select a department form a list using
//the passed in prompt
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
// 'C'  addEmployee() - Adds a new employee after asking the user 
//          for the first_name, last_name, role and manager
//
//      promptForFirstName() - Prompts the user to enter the employee's 
//          first name (employee.first_name)

//      promptForLastName() - Prompts the user to enter the employee's 
//          last name (employee.last_name)
//
//      selectManager() - employee.mgr_id
//
// 'R'  chk_employee_manager_fk(employeeID: number): Promise<number>
//          Check if employee.id is a manager (employee.manager_id) 
//          for any employees
//
//      chk_role_fk_employee(roleID: number): Promise<number> - Check 
//          if role.id is a foreign key in employee (employee.role_id)
//
//      getEmployees(): Promise<EmployeeID[]> - Used by inquirer to 
//          allow user to select from a list of employee names, 
//          titles, etc. to return the id of the selected employee
//
//      selectEmployee(selectPrompt: string): Promise<EmployeeID>
//          Asks the user to select from a list, an employee using
//          the passed in prompt.
//          
//      getEmployeesDetails() - Selects a list of employees details
//                              to display to the user
//
//      displayEmployeesByDepartment() - Retrieves employees and 
//          departments ordered by department name, employee last name,
//          employee first name
//
//      displayEmployeesByManager() - Retrieves and displays to the console
//          employees and managers ordered by manager last_name, 
//          manager first_name, employee last name, employee first name
//
//      displayDeptUtilizedBudget() - Displays by department the total 
//          amount spent on employee salaries.
//
//  'U' updateEmployeeManagerID() - Assigns a new manager to 
//                                  an employee
//
//      updateEmployeeRoleID()    - Assigns a new role to an employee  
//
//      deleteEmployee() - Prompts the user for the employee to delete,
//          then deletes the employee.
//
//////////////////////////////////////

//Adds a new employee after asking the user for the first_name, 
//last_name, role and manager
export async function addEmployee() {
    const firstName = await promptForFirstName();
    const lastName = await promptForLastName();
    const promptString = 'Select New Employees Role:'
    const role = await selectRoleID(promptString);
    const managerID = await selectManager();

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
    return new Promise((resolve, reject) => {
        pool.query(
            sql,
            [firstName, lastName, role.id, managerID],
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

//Prompts the user to enter the employee's first name (employee.first_name)
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

//Prompts the user to enter the employee's last name (employee.last_name)
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

//Check if employee.id is a manager (employee.manager_id) for any employees 
async function chk_employee_manager_fk(employeeID: number): Promise<number> {
    const sql = `SELECT e.id, COUNT(*)
        FROM employee e WHERE e.manager_id = $1 
        GROUP BY e.id`;
    return new Promise((resolve, reject) => {
        pool.query(sql, [employeeID], (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                let returnCount = 0;
                if (result.rowCount === null) returnCount = 0;
                else returnCount = result.rowCount;
                resolve(returnCount); // Resolve the promise with the rowCount
            }
        });
    });

}//async function chk_employee_manager_fk(employeeID: number): Promise<number>

//Check if role.id is a foreign key in employee(employee.role_id)
async function chk_role_fk_employee(roleID: number): Promise<number> {
    const sql = `SELECT e.role_id, COUNT(*)
        FROM employee e WHERE e.role_id = $1 
        GROUP BY e.role_id`;
    return new Promise((resolve, reject) => {
        pool.query(sql, [roleID], (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                let returnCount = 0;
                if (result.rowCount === null) returnCount = 0;
                else returnCount = result.rowCount;
                resolve(returnCount); // Resolve the promise with the rowCount
            }
        });
    });

}//async function chk_role_fk_employee(roleID: number): Promise<number>

//Prompts the user for the employee to delete, then deletes 
//the employee.
export async function deleteEmployee() {
    const promptString = 'Please Select The Employee You Would Like To Delete';
    const empRec = await selectEmployee(promptString);

    //If employee.id is a foreign key in employee.manager_id, Display
    //an error message and Reject deleting the employee 
    const rowCount = await chk_employee_manager_fk(empRec.id);
    if (rowCount > 0) {
        console.log("Unable to delete employee: " + empRec.employeeName);
        console.log("employee manages other employees. ");
        return;
    }
    const sql = `DELETE FROM employee
                WHERE id = $1`;
    return new Promise((resolve, reject) => {
        pool.query(sql, [empRec.id], (err: Error, result: QueryResult) => {
            if (err) {
                console.error("Unable to delete Employee " + empRec.employeeName + err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.log(empRec.employeeName + " deleted.")
                resolve(result); // Resolve the promise with the rowCount
            }
        });
    });
    return 0
}//export async function deleteEmployee() {

//Retrieves employees and departments ordered by department name, 
//employee last name, employee first name
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

//Retrieves and displays to the console employees and managers 
//ordered by manager last_name, manager first_name, employee 
//last name, employee first name
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

//Asks the user to select from a list, an employee using
//the passed in prompt.
async function selectEmployee(selectPrompt: string): Promise<EmployeeID> {
    const sql = `SELECT e.id, e.first_name || ' ' || e.last_name || ' - ' || title || ' - Dept - ' || d.name AS "name"
FROM employee e INNER JOIN role r
on e.role_id = r.id
INNER JOIN department d
ON d.id = r.department_id
ORDER BY d.name, e.last_name
`;

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
                        name: 'selectedEmployee',
                        message: selectPrompt,
                        choices: choices
                    }
                ]).then(answers => {
                    // Find the selected employee name using the selected ID
                    const selectedEmp = choices.find(choice => choice.value === answers.selectedEmployee) || { name: 'unknown' };
                    console.log(`You selected employee: ${selectedEmp.name}`); // Display department name
                    console.log(`You selected employee id: ${answers.selectedEmployee}`); // Display department name
                    // Resolve with an object containing both the selected employee ID and name
                    resolve({
                        id: answers.selectedEmployee,
                        employeeName: selectedEmp.name
                    });
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            }
        });
    });
}//function selectEmployee(selectPrompt: string): Promise<EmployeeID>

//Assigns a new manager to an employee
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
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });

    });
}//export async function updateEmployeeManagerID()

//Assigns a new role to an employee (employee.role_id)
export async function updateEmployeeRoleID() {
    const id = await selectEmployeeForRoleChange();
    const promptString = 'Select Employees New Role:'
    const role = await selectRoleID(promptString);
    const values = [role.id, id]
    const sql = `UPDATE employee 
        SET role_id = $1
        WHERE id = $2`;

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.log("Employee Role Updated");
                resolve(result.rows); // Resolve the promise with the result rows
            }
        });
    });
}//export async function updateEmployeeRoleID()

//Used by inquirer to allow user to select from a list of employee 
//names, titles, etc. to return the id of the selected employee
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

//Need to select an employee for the employee.manager_id change
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

} //async function selectEmployeeForManagerChange()

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

//Selects a list of employees details to display to the user
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
//      addRole() - Asks the user for role title, salary, and 
//          department, Then adds the role to the role table.
//
//          promptForRoleTitle() - used to create role.title
//
//          promptForSalary() - used to create role.salary
//
//  'R'
//      getRoles(): Promise<Role[]> - Retrieves a list of roles 
//          (id, title, department.name, salary)
//
//      selectRoleID(promptString)
//
//      getEmployees(): Promise<EmployeeID[]> - Used by inquirer to 
//          allow user to select from a list of employee names, 
//          titles, etc. to return the id of the selected employee
//
//      getEmployeesDetails() - Selects a list of employees details
//                              to display to the user
//
//      chk_department_fk_role(departmentID: number): Promise<number>
//          Check if department.id is a foreign key in role table 
//          (role.department_id)
//
//      displayEmployeesByDepartment() - Retrieves employees and 
//          departments ordered by department name, employee last name,
//          employee first name
//
//      displayDeptUtilizedBudget() - Displays by department the total 
//          amount spent on employee salaries.
//
//  'D' deleteRole():Promise <number> - Asks user to select a role 
//          before deleting the role.
//
//////////////////////////////////////

//Asks the user for role title, salary, and department
//Then adds the role to the role table.
export async function addRole() {
    const roleTitle = await promptForRoleTitle();
    console.log("RoleTitle: " + roleTitle);
    const salary = await promptForSalary();
    console.log("Salary: " + salary);
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

//Check if department.id is a foreign key in role table (department_id)
async function chk_department_fk_role(departmentID: number): Promise<number> {
    const sql = `SELECT r.department_id, COUNT(*)
        FROM role r WHERE r.department_id = $1 
        GROUP BY r.department_id`;
    return new Promise((resolve, reject) => {
        pool.query(sql, [departmentID], (err: Error, result: QueryResult) => {
            if (err) {
                console.error(err);
                reject(err); // Reject the promise if there's an error
            } else {
                let returnCount = 0;
                if (result.rowCount === null) returnCount = 0;
                else returnCount = result.rowCount;
                resolve(returnCount); // Resolve the promise with the rowCount
            }
        });
    });

}//async function chk_department_fk_role(departmentID: number): Promise<number>


export async function deleteRole(): Promise<number> {
    const promptString = 'Please Select The Role You Would Like To Delete';
    const role = await selectRoleID(promptString);

    //If role.id is a foreign key in the employee table, Display
    //an error message and Reject deleting the role 
    const rowCount = await chk_role_fk_employee(role.id);
    if (rowCount > 0) {
        console.log("Unable to delete Role: " + role.title);
        console.log("Role " + role.title + " is used in the employee table.");
        return 0;
    }
    const sql = `DELETE FROM role
                WHERE id = $1`;
    return new Promise((resolve, reject) => {
        pool.query(sql, [role.id], (err: Error, result: QueryResult) => {
            if (err) {
                console.error("Unable to delete Role " + role.title + err);
                reject(err); // Reject the promise if there's an error
            } else {
                console.log(role.title + " deleted.")
                let rowCount = 0;
                if (result.rowCount === null) {
                    rowCount = 0;
                } else {
                    rowCount = result.rowCount;
                }
                resolve(rowCount); // Resolve the promise with the rowCount
            }
        });
    });

}//export async function deleteRole()


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

//Retrieves a list of roles (id, title, department.name, salary)
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

async function selectRoleID(promptString: string): Promise<Role> {
    const results = await getRoles(); // Get the roles from the database
    const choices = results.map((result: Role) => ({
        name: result.title, // Use the title for display
        value: result.id    // Use the id as the value to return
    }));

    // Directly await the inquirer prompt
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'roleID',
            message: promptString,
            choices: choices
        }
    ]);

    // Find the selected role name using the selected ID
    const selectedRole = choices.find(choice => choice.value === answers.roleID) || { name: 'unknown' };
    console.log(`You selected role: ${selectedRole.name}`); // Display role title

    // Return an object containing both the selected role ID and title
    return {
        id: answers.roleID,
        title: selectedRole.name,
        salary: 0, //not used
        department: 0 //Not Used
    };
}//async function selectRoleID(promptString: string): Promise<Role>

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
}//export async function displayRoles()
