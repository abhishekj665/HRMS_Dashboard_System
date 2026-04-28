import {
  Department,
  Employee,
  JobRequisition,
  User,
} from "../../models/Associations.model.js";
import ExpressError from "../../utils/Error.utils.js";
import STATUS from "../../constants/Status.js";
import { Op } from "sequelize";

export const registerDepartment = async (data, tenantId) => {
  try {
    if (!data?.name || !data.name.trim()) {
      throw new ExpressError("Department name is required", STATUS.BAD_REQUEST);
    }

    const existingDepartment = await Department.findOne({
      where: { name: data.name.trim(), tenantId },
    });

    if (existingDepartment) {
      throw new ExpressError("Department already exists", STATUS.CONFLICT);
    }

    const department = await Department.create({
      ...data,
      name: data.name.trim(),
      tenantId,
    });

    return {
      success: true,
      message: "Department created successfully",
      data: department.id,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getDepartments = async (tenantId) => {
  try {
    const departments = await Department.findAll({
      where: { tenantId },
      attributes: ["id", "name", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const departmentIds = departments.map((department) => department.id);

    if (!departmentIds.length) {
      return {
        success: true,
        message: "Departments fetched successfully",
        data: [],
      };
    }

    const [employees, users, requisitions] = await Promise.all([
      Employee.findAll({
        where: { tenantId, departmentId: { [Op.in]: departmentIds } },
        attributes: ["id", "userId", "departmentId", "role", "isActive"],
      }),
      User.findAll({
        where: { tenantId },
        attributes: [
          "id",
          "email",
          "first_name",
          "last_name",
          "role",
          "managerId",
          "isBlocked",
        ],
      }),
      JobRequisition.findAll({
        where: {
          tenantId,
          departmentId: { [Op.in]: departmentIds },
        },
        attributes: [
          "id",
          "title",
          "status",
          "priority",
          "headCount",
          "departmentId",
          "createdAt",
        ],
        order: [["createdAt", "DESC"]],
      }),
    ]);

    const userMap = new Map(users.map((user) => [user.id, user]));

    const departmentData = departments.map((department) => {
      const departmentEmployees = employees.filter(
        (employee) => employee.departmentId === department.id,
      );

      const members = departmentEmployees
        .map((employee) => {
          const user = userMap.get(employee.userId);
          if (!user) return null;

          const fullName = [user.first_name, user.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            managerId: user.managerId || null,
            name: fullName || user.email?.split("@")[0] || "Unknown User",
            isBlocked: user.isBlocked,
            isActive: employee.isActive ?? true,
          };
        })
        .filter(Boolean);

      const managerFromEmployee = members.filter((member) => {
        return member.role === "manager";
      });

      const managerFromWorkers = [
        ...new Set(members.map((member) => member.managerId).filter(Boolean)),
      ]
        .map((managerId) => {
          const manager = userMap.get(managerId);
          if (!manager) return null;

          const fullName = [manager.first_name, manager.last_name]
            .filter(Boolean)
            .join(" ")
            .trim();

          return {
            id: manager.id,
            email: manager.email,
            role: manager.role,
            name: fullName || manager.email?.split("@")[0] || "Manager",
          };
        })
        .filter(Boolean);

      const managers = [
        ...new Map(
          [...managerFromEmployee, ...managerFromWorkers].map((manager) => [
            manager.id,
            manager,
          ]),
        ).values(),
      ];

      const departmentRequisitions = requisitions.filter(
        (requisition) => requisition.departmentId === department.id,
      );

      const ongoingProjects = departmentRequisitions.filter((requisition) =>
        ["DRAFT", "PENDING", "APPROVED"].includes(requisition.status),
      );

      const activeMembers = members.filter((member) => member.isActive).length;
      const totalMembers = members.length;
      const performanceScore = totalMembers
        ? Math.min(
            100,
            Math.round(
              (activeMembers / totalMembers) * 70 +
                Math.min(ongoingProjects.length * 10, 30),
            ),
          )
        : 0;

      return {
        id: department.id,
        name: department.name,
        createdAt: department.createdAt,
        members,
        managers,
        ongoingProjects: ongoingProjects.map((project) => ({
          id: project.id,
          title: project.title,
          status: project.status,
          priority: project.priority,
          headCount: project.headCount,
          createdAt: project.createdAt,
        })),
        counts: {
          members: totalMembers,
          managers: managers.length,
          ongoingProjects: ongoingProjects.length,
        },
        performance: {
          score: performanceScore,
          activeMembers,
          totalMembers,
        },
      };
    });

    return {
      success: true,
      message: "Departments fetched successfully",
      data: departmentData,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};

export const getDepartmentById = async (id, tenantId) => {
  try {
    const department = await Department.findOne({
      where: { id, tenantId },
    });

    if (!department) {
      throw new ExpressError("Department not found", STATUS.NOT_FOUND);
    }

    return {
      success: true,
      message: "Department fetched successfully",
      data: department,
    };
  } catch (error) {
    throw new ExpressError(STATUS.BAD_REQUEST, error.message);
  }
};
