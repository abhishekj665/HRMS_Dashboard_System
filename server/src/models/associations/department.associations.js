import JobPosting from "../RecruitmentModels/JobPosting.model.js";
import Department from "../Department/Department.model.js";
import Employee from "../EmployeeModels/Employee.model.js";
import JobRequisition from "../RecruitmentModels/JobRequisition.model.js";

Department.hasMany(Employee, {
  foreignKey: "departmentId",
  as: "employees",
});

Employee.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

JobRequisition.belongsTo(Department, {
  foreignKey: "departmentId",
  as: "department",
});

Department.hasMany(JobRequisition, {
  foreignKey: "departmentId",
  as: "requisitions",
});


export default Employee;
