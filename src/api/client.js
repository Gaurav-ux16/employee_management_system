import axios from 'axios';
import {
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  RECENT_ACTIVITY_LOGS,
} from './mockData';

// Configurable API Base URL - easily switchable to Python FastAPI backend
export const API_BASE_URL = 'http://localhost:8000/api/v1';

// Axios Instance configured for backend calls
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Flag to toggle between local mock store and live API server
export const USE_MOCK_DATA = true;

// In-Memory Persistent Store for client session
let mockEmployees = [...INITIAL_EMPLOYEES];
let mockDepartments = [...INITIAL_DEPARTMENTS];
let mockAttendance = [...INITIAL_ATTENDANCE];
let mockLeaves = [...INITIAL_LEAVES];
let mockActivities = [...RECENT_ACTIVITY_LOGS];

let currentUser = {
  id: 'EMP-1001',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@ops.co',
  role: 'ADMIN',
  designation: 'VP of Operations',
  department: 'Operations & Logistics',
  avatar: 'RS',
};

// Utility to simulate network delay for realistic visual loading feedback
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== AUTH APIS ====================
export const authApi = {
  login: async (email, password) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      if (email === 'admin@ops.co' || email.includes('@ops.co')) {
        const found = mockEmployees.find((e) => e.email.toLowerCase() === email.toLowerCase());
        if (found) {
          currentUser = {
            id: found.id,
            name: `${found.first_name} ${found.last_name}`,
            email: found.email,
            role: 'ADMIN',
            designation: found.designation,
            department: found.department,
            avatar: found.avatar,
          };
        }
        return {
          data: {
            access_token: 'mock-jwt-token-ops-workspace-2026',
            token_type: 'bearer',
            user: currentUser,
          },
        };
      }
      throw { response: { status: 401, data: { detail: 'Invalid credentials. Use admin@ops.co' } } };
    }
    return apiClient.post('/auth/login', { email, password });
  },

  getMe: async () => {
    if (USE_MOCK_DATA) {
      await delay(150);
      return { data: currentUser };
    }
    return apiClient.get('/auth/me');
  },
};

// ==================== DASHBOARD APIS ====================
export const dashboardApi = {
  getStats: async () => {
    if (USE_MOCK_DATA) {
      await delay(200);
      const totalEmployees = mockEmployees.length;
      const activeEmployees = mockEmployees.filter((e) => e.status === 'ACTIVE').length;
      const onLeaveCount = mockEmployees.filter((e) => e.status === 'ON_LEAVE').length;
      
      const presentToday = mockAttendance.filter((a) => a.status === 'PRESENT').length;
      const absentToday = mockAttendance.filter((a) => a.status === 'ABSENT').length;
      const halfDayToday = mockAttendance.filter((a) => a.status === 'HALF_DAY').length;

      const pendingLeaves = mockLeaves.filter((l) => l.status === 'PENDING').length;
      const departmentCount = mockDepartments.length;

      return {
        data: {
          total_employees: totalEmployees,
          active_employees: activeEmployees,
          on_leave_employees: onLeaveCount,
          attendance: {
            present: presentToday,
            absent: absentToday,
            half_day: halfDayToday,
            rate: Math.round((presentToday / totalEmployees) * 100),
          },
          pending_leaves: pendingLeaves,
          department_count: departmentCount,
          activities: mockActivities,
        },
      };
    }
    return apiClient.get('/dashboard/stats');
  },
};

// ==================== EMPLOYEE APIS ====================
export const employeeApi = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      let filtered = [...mockEmployees];

      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.first_name.toLowerCase().includes(q) ||
            e.last_name.toLowerCase().includes(q) ||
            e.employee_code.toLowerCase().includes(q) ||
            e.designation.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q)
        );
      }

      if (params.department && params.department !== 'ALL') {
        filtered = filtered.filter((e) => e.department === params.department);
      }

      if (params.status && params.status !== 'ALL') {
        filtered = filtered.filter((e) => e.status === params.status);
      }

      return { data: filtered };
    }
    return apiClient.get('/employees', { params });
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(150);
      const emp = mockEmployees.find((e) => e.id === id || e.employee_code === id);
      if (!emp) throw { response: { status: 404, data: { detail: 'Employee not found' } } };
      return { data: emp };
    }
    return apiClient.get(`/employees/${id}`);
  },

  create: async (employeeData) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const nextIdNum = mockEmployees.length + 1001;
      const code = employeeData.employee_code || `EMP-${nextIdNum}`;
      const newEmp = {
        ...employeeData,
        id: code,
        employee_code: code,
        avatar: `${employeeData.first_name[0] || 'E'}${employeeData.last_name[0] || 'M'}`,
        status: employeeData.status || 'ACTIVE',
      };
      mockEmployees = [newEmp, ...mockEmployees];

      // Add audit log
      mockActivities = [
        {
          id: `ACT-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Employee Onboarded',
          desc: `${newEmp.first_name} ${newEmp.last_name} (${newEmp.designation}) added to ${newEmp.department}.`,
          type: 'ONBOARD',
        },
        ...mockActivities,
      ];

      return { data: newEmp };
    }
    return apiClient.post('/employees', employeeData);
  },

  update: async (id, employeeData) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const index = mockEmployees.findIndex((e) => e.id === id || e.employee_code === id);
      if (index === -1) throw { response: { status: 404, data: { detail: 'Employee not found' } } };
      
      const updated = { ...mockEmployees[index], ...employeeData };
      mockEmployees[index] = updated;
      return { data: updated };
    }
    return apiClient.put(`/employees/${id}`, employeeData);
  },

  delete: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(250);
      const emp = mockEmployees.find((e) => e.id === id);
      mockEmployees = mockEmployees.filter((e) => e.id !== id && e.employee_code !== id);
      
      if (emp) {
        mockActivities = [
          {
            id: `ACT-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Employee Removed',
            desc: `Record for ${emp.first_name} ${emp.last_name} was deleted.`,
            type: 'DELETE',
          },
          ...mockActivities,
        ];
      }
      return { data: { success: true } };
    }
    return apiClient.delete(`/employees/${id}`);
  },
};

// ==================== DEPARTMENT APIS ====================
export const departmentApi = {
  getAll: async () => {
    if (USE_MOCK_DATA) {
      await delay(200);
      // Annotate headcount
      const withCounts = mockDepartments.map((dept) => {
        const count = mockEmployees.filter((e) => e.department === dept.name).length;
        return { ...dept, employee_count: count };
      });
      return { data: withCounts };
    }
    return apiClient.get('/departments');
  },

  create: async (deptData) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const nextId = `DEP-10${mockDepartments.length + 1}`;
      const newDept = {
        ...deptData,
        id: nextId,
        employee_count: 0,
      };
      mockDepartments = [...mockDepartments, newDept];
      return { data: newDept };
    }
    return apiClient.post('/departments', deptData);
  },

  update: async (id, deptData) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const idx = mockDepartments.findIndex((d) => d.id === id);
      if (idx === -1) throw { response: { status: 404, data: { detail: 'Department not found' } } };
      mockDepartments[idx] = { ...mockDepartments[idx], ...deptData };
      return { data: mockDepartments[idx] };
    }
    return apiClient.put(`/departments/${id}`, deptData);
  },

  delete: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(250);
      mockDepartments = mockDepartments.filter((d) => d.id !== id);
      return { data: { success: true } };
    }
    return apiClient.delete(`/departments/${id}`);
  },
};

// ==================== ATTENDANCE APIS ====================
export const attendanceApi = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      let list = [...mockAttendance];

      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((a) => a.employee_name.toLowerCase().includes(q) || a.employee_id.toLowerCase().includes(q));
      }

      if (params.status && params.status !== 'ALL') {
        list = list.filter((a) => a.status === params.status);
      }

      if (params.department && params.department !== 'ALL') {
        list = list.filter((a) => a.department === params.department);
      }

      return { data: list };
    }
    return apiClient.get('/attendance', { params });
  },

  getByEmployeeId: async (employeeId) => {
    if (USE_MOCK_DATA) {
      await delay(150);
      const records = mockAttendance.filter((a) => a.employee_id === employeeId);
      return { data: records };
    }
    return apiClient.get(`/attendance/${employeeId}`);
  },

  create: async (attendanceData) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const newAtt = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        check_in: '09:00 AM',
        check_out: '--',
        hours: 'In Progress',
        status: 'PRESENT',
        ...attendanceData,
      };
      mockAttendance = [newAtt, ...mockAttendance];
      return { data: newAtt };
    }
    return apiClient.post('/attendance', attendanceData);
  },

  update: async (id, attendanceData) => {
    if (USE_MOCK_DATA) {
      await delay(250);
      const idx = mockAttendance.findIndex((a) => a.id === id);
      if (idx !== -1) {
        mockAttendance[idx] = { ...mockAttendance[idx], ...attendanceData };
        return { data: mockAttendance[idx] };
      }
      throw { response: { status: 404, data: { detail: 'Attendance record not found' } } };
    }
    return apiClient.put(`/attendance/${id}`, attendanceData);
  },
};

// ==================== LEAVE APIS ====================
export const leaveApi = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await delay(200);
      let list = [...mockLeaves];
      if (params.status && params.status !== 'ALL') {
        list = list.filter((l) => l.status === params.status);
      }
      return { data: list };
    }
    return apiClient.get('/leaves', { params });
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(150);
      const l = mockLeaves.find((item) => item.id === id);
      return { data: l };
    }
    return apiClient.get(`/leaves/${id}`);
  },

  create: async (leaveData) => {
    if (USE_MOCK_DATA) {
      await delay(300);
      const newLeave = {
        id: `LV-${Math.floor(100 + Math.random() * 900)}`,
        status: 'PENDING',
        applied_on: new Date().toISOString().split('T')[0],
        ...leaveData,
      };
      mockLeaves = [newLeave, ...mockLeaves];

      mockActivities = [
        {
          id: `ACT-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Leave Requested',
          desc: `${newLeave.employee_name} submitted a ${newLeave.leave_type} request (${newLeave.days_count} days).`,
          type: 'LEAVE',
        },
        ...mockActivities,
      ];

      return { data: newLeave };
    }
    return apiClient.post('/leaves', leaveData);
  },

  approve: async (id) => {
    if (USE_MOCK_DATA) {
      await delay(250);
      const idx = mockLeaves.findIndex((l) => l.id === id);
      if (idx !== -1) {
        mockLeaves[idx].status = 'APPROVED';
        
        // Update employee status if current leave
        const empIdx = mockEmployees.findIndex((e) => e.id === mockLeaves[idx].employee_id || e.employee_code === mockLeaves[idx].employee_code);
        if (empIdx !== -1) {
          mockEmployees[empIdx].status = 'ON_LEAVE';
        }

        mockActivities = [
          {
            id: `ACT-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Leave Approved',
            desc: `Leave request ${id} for ${mockLeaves[idx].employee_name} was APPROVED.`,
            type: 'LEAVE_ACTION',
          },
          ...mockActivities,
        ];

        return { data: mockLeaves[idx] };
      }
      throw { response: { status: 404, data: { detail: 'Leave request not found' } } };
    }
    return apiClient.put(`/leaves/${id}/approve`);
  },

  reject: async (id, reason = 'Administrative decision') => {
    if (USE_MOCK_DATA) {
      await delay(250);
      const idx = mockLeaves.findIndex((l) => l.id === id);
      if (idx !== -1) {
        mockLeaves[idx].status = 'REJECTED';
        mockLeaves[idx].rejection_reason = reason;

        mockActivities = [
          {
            id: `ACT-${Date.now()}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Leave Rejected',
            desc: `Leave request ${id} for ${mockLeaves[idx].employee_name} was REJECTED.`,
            type: 'LEAVE_ACTION',
          },
          ...mockActivities,
        ];

        return { data: mockLeaves[idx] };
      }
      throw { response: { status: 404, data: { detail: 'Leave request not found' } } };
    }
    return apiClient.put(`/leaves/${id}/reject`, { reason });
  },
};
