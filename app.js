const inquirer = require('inquirer');
const fs = require("fs");

const mysql = require('mysql2');
require('console.table');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'employeeDb',
    password: 'password'
})
const promptMenu = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: ['view all departments', 'view all roles', 'view all employees', 'add a department', 'add a role', 'add an employee', 'update an employee role', 'exit']
        }])
        .then(userChoice => {
            switch (userChoice.menu) {
                case 'view all departments':
                    selectDepartments();
                    break;
                case 'view all roles':
                    selectRoles();
                    break;
                case 'view all employees':
                    selectEmployees();
                    break;
                case 'add a department':
                    promptAddDepartment();
                    break;
                case 'add a role':
                    promptAddRole();
                    break;
                case 'add an employee':
                    promptAddEmployee();
                    break;
                case 'update an employee role':
                    promptUpdateRole();
                    break;
                default:
                    process.exit();
            }
        });
};
const selectDepartments = () => {
    connection.query(
        'SELECT * FROM department;',
        (err, results) => {
            console.table(results); 
            promptMenu();
        });

};
const selectRoles = () => {
    connection.query(
        'SELECT * FROM role;',
        (err, results) => {
            console.table(results); 
            promptMenu();
        }
    )
};
const selectEmployees = () => {
    connection.query(
        "SELECT E.id, E.first_name, E.last_name, R.title, D.name AS department, R.salary, CONCAT(M.first_name,' ',M.last_name) AS manager FROM employee E JOIN role R ON E.role_id = R.id JOIN department D ON R.department_id = D.id JOIN employee M ON E.manager_id = M.id;",
        (err, results) => {
            console.table(results); // results contains rows returned by server
            promptMenu();
        }
    )
};



const promptAddDepartment = () => {
    inquirer.prompt([{
        type: 'input',
        name: 'departmentName',
        message: 'Name the department you would like to add?',
        validate: departmentName => {
            if (departmentName) {
                return true;
            } else {
                console.log('Please enter the name of your department!');
                return false;
            }
        }
    }
    ])
        .then(departmentName => {
            const query = connection.query(
                "INSERT INTO department SET ?",
                {
                    name: departmentName
                },
                function (err, res) {
                    if (err) throw err;
                    console.log(departmentName);
                }
            )
        })

        .then(() => selectDepartments())
}


const promptAddRole = () => {

    return connection.promise().query(
        "SELECT department.id, department.name FROM department;"
    )
        .then(([departments]) => {
            let departmentChoices = departments.map(({
                id,
                name
            }) => ({
                name: name,
                value: id
            }));
            inquirer.prompt(
                [{
                    type: 'input',
                    name: 'name',
                    message: 'Enter the name of your title (Required)',
                    validate: titleName => {
                        if (titleName) {
                            return true;
                        } else {
                            console.log('Please enter your title name!');
                            return false;
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'department',
                    message: 'Which department are you from?',
                    choices: departmentChoices
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter your salary (Required)',
                    validate: salary => {
                        if (salary) {
                            return true;
                        } else {
                            console.log('Please enter your salary!');
                            return false;
                        }
                    }
                }
                ]
            )
                .then(roles => {
                    
                    console.log(roles);
                

                    promptAddEmployee(roles);
                });

        })
}


const promptAddEmployee = (roles) => {

    return connection.promise().query(
        "SELECT R.id, R.title FROM role R;"
    )
        .then(([employees]) => {
            let titleChoices = employees.map(({
                id,
                title
            }) => ({
                title: id,
                value: title
            }))
            inquirer.prompt(
                [{
                    type: 'input',
                    name: 'firstName',
                    message: 'What is the employees first name (Required)',
                    validate: firstName => {
                        if (firstName) {
                            return true;
                        } else {
                            console.log('Please enter the employees first name!');
                            return false;
                        }
                    }
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is the employees last name (Required)',
                    validate: lastName => {
                        if (lastName) {
                            return true;
                        } else {
                            console.log('Please enter the employees last name!');
                            return false;
                        }
                    }
                },
                {
                    type: 'list',
                    name: 'employeesRole',
                    message: 'What is the employees role?',
                    choices: titleChoices
                },
              
                {
                    type: 'input',
                    name: 'manager',
                    message: 'Who is the employees manager? (Required)',
                    validate: manager => {
                        if (manager) {
                            return true;
                        } else {
                            console.log('Please enter your employees manager!');
                            return false;
                        }
                    }
                }]
            ).then(employees => {
               
                console.table(employees);
                console.log(employees + "inserted successfully!\n");
                resolve(rows);
            });

        })
}

const promptUpdateRole = () => {

    return connection.promise().query(
        "SELECT E.role_id, E.manager_id, CONCAT(E.first_name,' ',E.last_name) AS employee, CONCAT(M.first_name,' ',M.last_name) AS manager FROM employee E JOIN employee M ON E.manager_id = M.id;"
    )
        .then(([managers]) => {
            let managerChoices = managers.map(({
                manager_id,
                manager
            }) => ({
                name: manager,
                value: manager_id
            }));
            let employeeChoices = managers.map(({
                role_id,
                employee
            }) => ({
                name: employee,
                value: role_id
            }));

            inquirer.prompt(
                [{
                    type: 'input',
                    name: 'name',
                    message: 'Which employees manager would you like to update? (Required)',
                    choices: managerChoices
                },
                {
                    type: 'list',
                    name: 'department',

                    message: 'Which employee do you want to set as manager for the selected employee?',
                    choices: employeeChoices
                }
                ]
            )
                .then(managers => {
                    // TODO: Update the managers with the responses.
                    console.log(managers);
                });

        })
}
promptMenu();