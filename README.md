# Week10-Challenge-Repository - Employee Tracker Application

![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)

## Description
This application is a commandline prompt driven application that allows me to view and manage the departments, roles, and employees in my company.

The employee tracker application allows me to start to learn how to access a traditional SQL Relational Database using Typescript, Inquirer, pg and the ProgresSql relational database. While I have programmed with multiple relational databases, (Oracle, Sybase, DB2, mySQL, Microsoft SQL Server) it has allowed me to learn how to access one of the web based SQL database that I have not worked with before.

## Installation
All code is located in the gitHub repository https://github.com/SparkKids/Week10-Challenge-Repository

To install the application download all the code into a root directory. For example: C:/Challenge-10/Main

in a git-bash command prompt cd into the root directory:
cd ~/Challenge-10/Main/
Then run the following npm commands:
npm install
npm run build

These npm commands install all dependencies for the program and build the package for execution

## Usage
The package is run from the command line prompt:
From  ~/Challenge-10/Main/
Enter:
npm run start
This starts the application and displays the user prompts. The user uses the arrow keys to select what function to run. Here is the command line menu:
 What would you like to do?
❯ View All Employees
  View Employees By Department
  View Employees By Manager
  Add An Employee
  Delete An Employee
  Update Employee Role
  Update Employee Manager
  View All Roles
  Add A Role
  Delete A Role
❯ View All Departments
  View A Department's Total Utilized Budget
  Add A Department
  Delete A Department
  Exit The Program

  Employee Tracker Video: https://drive.google.com/file/d/1NnHglie_kFbz91J9dAH9xfoS0fRWWCbG/view

  ## Credits

  Extensive use was made of the BootCamp Xpert Learning Assistant. This AI tool was a valuable learning tool. It helped with debugging and understanding how to write better TypeScript. For example: My async function selectRoleID(promptString: string): Promise<Role> was trying to wrap await inquirer.prompt() in a new promise constructor. This is not allowed to embed an await in a promise constructor. The AI tool then showed how to await the inquirer.prompt call directly without using a promise.

  I found as I continued coding. I had to rely on the BootCamp Xpert Learning Assistant less often.

  ## License

  This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

  ## Badges
 ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

 ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)