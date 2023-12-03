// importing the models into to be the backbone of table.
const {Profession, Department, Employee} = require("./models")

// importing the connnection code between sequalize and javascript.
const sequelize = require('./connection');

const inquirer = require("inquirer"); 

// Syncs the database with created models
sequelize.sync({ force: false }).then(() => {
    options();
  });
  
  // Function written to prompt the user with different options to navigate the database
  function options() {
    inquirer
      .prompt([
        {
          type: "list",
          message: "What would you like to do?",
          choices: [
            "View All Departments",
            "View All Professions",
            "View All Employees",
            "Add Department",
            "Add Profession",
            "Add Employee",
            "Update Employee Profession",
            //   `(Move up and down to reveal more choices)`,
          ],
          name: "employeeTracker",
        },
      ])
      // Takes in user choice, checks with equality, and then fires off corresponding function
      .then((answer) => {
        if (answer.employeeTracker === "View All Departments") {
          viewAllDepartments();
        } else if (answer.employeeTracker === "View All Professions") {
          viewAllProfessions();
        } else if (answer.employeeTracker === "View All Employees") {
          viewAllEmployees();
        } else if (answer.employeeTracker === "Add Department") {
          addDepartment();
        } else if (answer.employeeTracker === "Add Profession") {
          addProfession();
        } else if (answer.employeeTracker === "Add Employee") {
          addEmployee();
        } else {
          updateEmployeeProfession();
        }
      });
  }
  
  // -------------- VIEW -----------------
  
  // View all departments
  const viewAllDepartments = () => {
    var departments = Department.findAll({ raw: true }).then((data) => {
      console.table(data);
      // Fires off prompts after table is displayed
      options();
    });
  };
  
  // View all Professions
  const viewAllProfessions = () => {
    var Professions = Profession.findAll({
      raw: true,
      // Joining Department table and Profession table
      include: [{ model: Department }],
    }).then((data) => {
      console.table(
        // Loops through data and returns new object, used to format tables
        data.map((Profession) => {
          return {
            id: Profession.id,
            title: Profession.title,
            salary: Profession.salary,
            department: Profession["Department.name"],
          };
        })
      );
      // Fires off prompts after table is displayed
      options();
    });
  };
  
  // View all employees
  const viewAllEmployees = () => {
    var employees = Employee.findAll({
      raw: true,
      // Joining Profession table, and Department table with Employee table
      include: [{ model: Profession, include: [{ model: Department }] }],
    }).then((data) => {
      const employeeLookup = {};
      // For loop used to grab employee names to be inserted below into managers column in newly created table
      for (var i = 0; i < data.length; i++) {
        const employee = data[i];
        employeeLookup[employee.id] =
          employee.first_name + " " + employee.last_name;
      }
      console.table(
        // Loops through data and returns new object, used to format tables
        data.map((employee) => {
          return {
            id: employee.id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            title: employee["Profession.title"],
            department: employee["Profession.Department.name"],
            salary: employee["Profession.salary"],
            manager: employeeLookup[employee.manager_id],
          };
        })
      );
      // Fires off prompts after table is displayed
      options();
    });
  };
  
  // -------------- ADD -----------------
  
  // Add department
  const addDepartment = () => {
    // Prompts user for name of new department
    inquirer
      .prompt([
        {
          type: "input",
          message: "Name of the new department?",
          name: "addDepartment",
        },
      ])
      // Takes in user input and adds answer to database
      .then((answer) => {
        Department.create({ name: answer.addDepartment }).then((data) => {
          // Fires off prompts after updating database
          options();
        });
      });
  };
  
  // Add Profession
  const addProfession = async () => {
    // Same as -> SELECT id AS VALUE, name AS name FROM Department;
    let departments = await Department.findAll({
      attributes: [
        ["id", "value"],
        ["name", "name"],
      ],
    });
    // Restructures raw data
    departments = departments.map((department) =>
      department.get({ plain: true })
    );
  
    // Prompts user for new Profession name, salary, and corresponding department
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the Profession?",
          name: "title",
        },
        {
          type: "input",
          message: "What is the employees's salary?",
          name: "salary",
        },
        {
          type: "list",
          message: "Which department should the employee be in?",
          name: "department_id",
          choices: departments,
        },
      ])
      // Takes in user inputs and adds answers to database
      .then((answer) => {
        Profession.create(answer).then((data) => {
          // Fires off prompts after updating database
          options();
        });
      });
  };
  
  // Add employee
  const addEmployee = async () => {
    let Professions = await Profession.findAll({
      attributes: [
        ["id", "value"],
        ["title", "name"],
      ],
    });
    // Restructures raw data
    Professions = Professions.map((Profession) => Profession.get({ plain: true }));
  
    let managers = await Employee.findAll({
      attributes: [
        ["id", "value"],
        ["first_name", "name"],
        ["last_name", "lastName"],
      ],
    });
    // Restructures raw data
    managers = managers.map((manager) => {
      manager.get({ plain: true });
      const managerInfo = manager.get();
      return {
        name: `${managerInfo.name} ${managerInfo.lastName}`,
        value: managerInfo.value,
      };
    });
    managers.push({ type: "Null Manager", value: null });
  
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the first name of the new employee?",
          name: "first_name",
        },
        {
          type: "input",
          message: "What is the last name of the new employee?",
          name: "last_name",
        },
        {
          type: "list",
          message: "New employees Profession?",
          name: "Profession_id",
          choices: Professions,
        },
        {
          type: "list",
          message: "The new employee should be assign to which manager?",
          name: "manager_id",
          choices: managers,
        },
      ])
      .then((answer) => {
        Employee.create(answer).then((data) => {
          options();
        });
      });
  };
  
  // Update employee Profession
  const updateEmployeeProfession = async () => {
    let employees = await Employee.findAll({
      attributes: [
        ["id", "value"],
        ["first_name", "name"],
        ["last_name", "lastName"],
      ],
    });
    // Restructures raw data
    employees = employees.map((employee) => {
      employee.get({ plain: true });
      const employeeInfo = employee.get();
      return {
        name: `${employeeInfo.name} ${employeeInfo.lastName}`,
        value: employeeInfo.value,
      };
    });
  
    let Professions = await Profession.findAll({
      attributes: [
        ["id", "value"],
        ["title", "name"],
      ],
    });

    Professions = Professions.map((Profession) => Profession.get({ plain: true }));
  
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee would you like to update their Profession?",
          name: "id",
          choices: employees,
        },
        {
          type: "list",
          message:
            "What Profession would you like to update this employee to?",
          name: "Profession_id",
          choices: Professions,
        },
      ])
      // Takes in user inputs and adds answers to database
      .then((answer) => {
        // Gives point of reference within database to where data should be updated
        Employee.update(answer, {
          where: {
            id: answer.id,
          },
        }).then((data) => {
          // Fires off prompts after updating database
          options();
        });
      });
  };