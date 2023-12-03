//importing models into index.js
const Employee = require("./employee");
const Department = require("./department");
const Profession = require("./profession");

// roles of each model below
Employee.belongsTo(Profession, {
    foriegnKey: "department_id",
    onDelete: "CASCADE",
});

Profession.hasOne(Employee, {
    foriegnKey: "profession_id",
    onDelete: "CASCADE",
});

Employee.hasOne(Employee, {
    foreignKey: "manager_id",
    onDelete: "CASCADE",
  });

  Department.hasMany(Profession, {
    foreignKey: "department_id",
    onDelete: "CASCADE",
  });

 Profession.belongsTo(Department, {
    foreignKey: "department_id",
    onDelete: "CASCADE",
  });

module.exports = {Employee, Department, Profession}