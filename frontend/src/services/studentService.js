// frontend/src/services/studentService.js
// This file is an alias for backward compatibility
export { 
  getAllParticipants as getAllStudents,
  getParticipantById as getStudentById,
  createParticipant as createStudent,
  updateParticipant as updateStudent,
  deleteParticipant as deleteStudent
} from './participantService';