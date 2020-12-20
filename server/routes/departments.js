const express = require("express");
const router = express.Router();
const auth = require('./auth');
const departmentController = require('../controllers/departmentController');

router.post("/department", auth.HRAuth, departmentController.addDepartment);
router.put("/department", auth.HRAuth, departmentController.updateDepartment);
router.delete("/department", auth.HRAuth, departmentController.deleteDepartment);

// HOD

// get all staff members of this department
router.get('/getAllStaffMembers', auth.HODAuth, departmentController.getAllStaffMembers);

// to get all the staff members of this department for a specific course
router.get('/getAllStaffMembers/:course', auth.HODAuth, departmentController.getStaffMembersPerCourse);

// to view the dayOff of all staff members for this department
router.get('/viewDayOff', auth.HODAuth, departmentController.viewDayOff);

// to view the dayOff of a certain staff member in this department
router.get('/viewDayOff/:idStaff', auth.HODAuth, departmentController.viewDayOffStaff);

// to view the all courses coverage for a certain department
router.get('/viewCourseCoverage', auth.HODAuth, departmentController.viewCourseCoverage);

// Assign/update/delete an instructor to a course
router.post('/assignInstructor', auth.HODAuth, departmentController.assignInstructor);
router.put('/assignInstructor', auth.HODAuth, departmentController.updateInstructor);
router.delete('/assignInstructor', auth.HODAuth, departmentController.deleteInstructor);

// view View teaching assignments (which staff members teach which slots) of course offered by his department.
router.get('/viewTeachingAssignments/:courseName', auth.HODAuth, departmentController.viewTeachingAssignments);

module.exports = router;  