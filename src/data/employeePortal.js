// ─────────────────────────────────────────────
//  TIMESHEET (current week, Mon-Sun)
// ─────────────────────────────────────────────
export const timesheet = [
  { day: 'Monday',    date: 'Sep 1',  clockIn: '8:02 AM', clockOut: '4:31 PM', hours: 8.5 },
  { day: 'Tuesday',   date: 'Sep 2',  clockIn: '7:58 AM', clockOut: '4:15 PM', hours: 8.3 },
  { day: 'Wednesday', date: 'Sep 3',  clockIn: '8:05 AM', clockOut: '4:00 PM', hours: 7.9 },
  { day: 'Thursday',  date: 'Sep 4',  clockIn: '—',       clockOut: '—',       hours: 0   },
  { day: 'Friday',    date: 'Sep 5',  clockIn: '—',       clockOut: '—',       hours: 0   },
  { day: 'Saturday',  date: 'Sep 6',  clockIn: '—',       clockOut: '—',       hours: 0   },
  { day: 'Sunday',    date: 'Sep 7',  clockIn: '—',       clockOut: '—',       hours: 0   },
]

export const upcomingShift = {
  label: 'Next Shift',
  day: 'Thursday, Sep 4',
  time: '8:00 AM – 4:30 PM',
  location: 'Portland, OR — Client Site',
}

// ─────────────────────────────────────────────
//  DOCUMENTS
// ─────────────────────────────────────────────
export const documents = [
  { id: 1, name: 'Offer Letter', category: 'Onboarding', date: 'Mar 6, 2023', size: '112 KB' },
  { id: 2, name: 'Employee Handbook', category: 'Policies', date: 'Mar 6, 2023', size: '842 KB' },
  { id: 3, name: 'Direct Deposit Authorization', category: 'Payroll', date: 'Mar 8, 2023', size: '58 KB' },
  { id: 4, name: 'Pay Stub — Aug 2026', category: 'Pay Stubs', date: 'Aug 29, 2026', size: '96 KB' },
  { id: 5, name: 'Pay Stub — Jul 2026', category: 'Pay Stubs', date: 'Jul 31, 2026', size: '95 KB' },
  { id: 6, name: 'W-4 Withholding Form', category: 'Tax', date: 'Mar 6, 2023', size: '74 KB' },
]

// ─────────────────────────────────────────────
//  ANNOUNCEMENTS
// ─────────────────────────────────────────────
export const announcements = [
  {
    id: 1,
    title: 'Q3 Recognition Awards Announced',
    date: 'Aug 28, 2026',
    body: 'Congratulations to everyone recognized in this quarter\'s awards ceremony. Your dedication continues to set the standard for our entire team.',
  },
  {
    id: 2,
    title: 'Updated Timesheet Submission Deadline',
    date: 'Aug 20, 2026',
    body: 'Starting next pay period, timesheets are due by 5:00 PM every Friday to ensure on-time processing.',
  },
  {
    id: 3,
    title: 'Open Enrollment Reminder',
    date: 'Aug 12, 2026',
    body: 'Benefits open enrollment closes September 15. Log in to your benefits portal to review or update your elections.',
  },
]

export const recognitionPoints = 1240
