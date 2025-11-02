"use client"
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
    getEmployeeAssignments, 
    enrichAssignmentsWithDetails,
    startTimeLog,
    stopTimeLog,
    getTimeLogsForAssignment,
    updateAssignmentStatus,
    type TimeLogResponse
} from "@/app/api/employeeApi";

interface ScheduledTask {
    id: string;
    customerName: string;
    vehicle: string;
    service: string;
    time: string;
    status: string;
    duration: string;
    startTimestamp?: number; // epoch ms when work started
    endTimestamp?: number;   // epoch ms when work finished
    assignmentId?: number; // Backend assignment ID
    appointmentId?: number; // Backend appointment ID
    timeLogId?: number; // Active time log ID
    timeLogs?: TimeLogResponse[];
}

export default function EmployeeSchedule() {
    const [schedule, setSchedule] = useState<{ [key: string]: ScheduledTask[] }>({});
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [tick, setTick] = useState(0); // updates every second to drive live timers
    const [isLoading, setIsLoading] = useState(true);
    const [focusedDay, setFocusedDay] = useState<string | null>(null);
    const [showEmptyDays, setShowEmptyDays] = useState<boolean>(true);

    useEffect(() => {
        // Check if user is authenticated and has EMPLOYEE role
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (!storedUser || !storedToken) {
            alert('Please log in to access this page.');
            window.location.href = '/';
            return;
        }

        try {
            const userData = JSON.parse(storedUser);
            const role = userData.role || 'CUSTOMER';
            setUserRole(role);

            if (role !== 'EMPLOYEE') {
                alert('Access Denied. Only employees can access this page.');
                window.location.href = '/Dashboard';
                return;
            }

            // Get employee ID from user data
            const employeeId = userData.id || userData.userId;
            if (!employeeId) {
                alert('Employee ID not found. Please log in again.');
                window.location.href = '/';
                return;
            }
            setUserId(employeeId);

            // Fetch schedule data from backend
            fetchScheduleData(employeeId);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    }, []);

    // 1-second ticker for live timers
    useEffect(() => {
        const intervalId = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(intervalId);
    }, []);

    // Fetch schedule data from backend
    const fetchScheduleData = async (employeeId: number) => {
        try {
            setIsLoading(true);
            // Get assignments
            const assignmentsData = await getEmployeeAssignments(employeeId);
            const enrichedAssignments = await enrichAssignmentsWithDetails(assignmentsData);
            
            // Get time logs for each assignment to show start/end times
            const scheduleData: { [key: string]: ScheduledTask[] } = {
                'Monday': [],
                'Tuesday': [],
                'Wednesday': [],
                'Thursday': [],
                'Friday': [],
                'Saturday': [],
                'Sunday': []
            };

            // Process each assignment
            for (const assignment of enrichedAssignments) {
                try {
                    // Get time logs for this assignment
                    let timeLogs: TimeLogResponse[] = [];
                    let activeTimeLog: TimeLogResponse | null = null;
                    
                    if (assignment.assignmentId) {
                        timeLogs = await getTimeLogsForAssignment(assignment.assignmentId);
                        // Normalize / sort logs by startTime asc so older logs appear first
                        timeLogs = timeLogs.sort((a, b) => {
                            const sa = a.startTime ? new Date(a.startTime).getTime() : 0;
                            const sb = b.startTime ? new Date(b.startTime).getTime() : 0;
                            return sa - sb;
                        });
                        // Find active time log (started but not finished)
                        activeTimeLog = timeLogs.find(log => log.startTime && !log.endTime) || null;
                    }

                    // Parse appointment date
                    const appointmentDate = assignment.appointmentDate || assignment.assignedDate;
                    if (!appointmentDate) continue;

                    const date = new Date(appointmentDate);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    
                    // Format time
                    const appointmentTime = assignment.appointmentTime || '09:00 AM';
                    const time = appointmentTime.includes('AM') || appointmentTime.includes('PM') 
                        ? appointmentTime 
                        : formatTime12Hour(appointmentTime);

                    // Compute accumulated duration (sum of all time logs) in seconds
                    let totalSeconds = 0;
                    let earliestStart: number | undefined = undefined;
                    try {
                        for (const tl of timeLogs) {
                            if (!tl || !tl.startTime) continue;
                            const s = new Date(tl.startTime).getTime();
                            const e = tl.endTime ? new Date(tl.endTime).getTime() : Date.now();
                            if (!earliestStart || s < earliestStart) earliestStart = s;
                            if (e > s) totalSeconds += Math.max(0, Math.floor((e - s) / 1000));
                        }
                    } catch (e) {
                        console.warn('Failed to compute total time for assignment', assignment.assignmentId, e);
                    }

                    let latestEnd: number | undefined = undefined;
                    try {
                        const ended = timeLogs.filter(t => t.endTime).map(t => new Date(t.endTime as string).getTime());
                        if (ended.length) latestEnd = Math.max(...ended);
                    } catch (e) {
                        // ignore
                    }

                    const formatDuration = (secs: number) => {
                        const h = Math.floor(secs / 3600);
                        const m = Math.floor((secs % 3600) / 60);
                        const s = secs % 60;
                        if (h > 0) return `${h}h ${m}m`;
                        if (m > 0) return `${m}m ${s}s`;
                        return `${s}s`;
                    };

                    const task: ScheduledTask = {
                        id: assignment.id,
                        customerName: assignment.customerName,
                        vehicle: assignment.vehicle,
                        service: assignment.service,
                        time: time,
                        status: assignment.status === 'ASSIGNED' ? 'Scheduled' : 
                                assignment.status === 'IN_PROGRESS' ? 'In Progress' :
                                assignment.status === 'COMPLETED' ? 'Completed' : assignment.status,
                        // Show accumulated duration (sum of previous logs + active log)
                        duration: totalSeconds > 0 ? formatDuration(totalSeconds) : (assignment.estimatedDuration || 'N/A'),
                        // Use active log timestamps for live display, fallback to earliestStart for start time
                        startTimestamp: activeTimeLog?.startTime
                            ? new Date(activeTimeLog.startTime).getTime()
                            : earliestStart,
                        // For end timestamp show the latest ended log's time if no active log
                        endTimestamp: activeTimeLog?.endTime
                            ? new Date(activeTimeLog.endTime).getTime()
                            : latestEnd,
                        assignmentId: assignment.assignmentId,
                        appointmentId: assignment.appointmentId,
                        timeLogId: activeTimeLog?.id
                        ,
                        timeLogs: timeLogs
                    };

                    if (scheduleData[dayName]) {
                        scheduleData[dayName].push(task);
                    }
                } catch (err) {
                    console.error(`Error processing assignment ${assignment.id}:`, err);
                }
            }

            setSchedule(scheduleData);
            // default focus: start the week view from today (preserve weekday flow)
            try {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                setFocusedDay(today);
            } catch (e) {
                setFocusedDay(null);
            }
        } catch (error) {
            console.error('Error fetching schedule data:', error);
            alert('Failed to load schedule. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime12Hour = (time24: string): string => {
        try {
            const [hours, minutes] = time24.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes || '00'} ${ampm}`;
        } catch {
            return time24;
        }
    };

    const getTotalTime = (tasks: ScheduledTask[]) => {
        const toHours = (dur: string) => {
            if (!dur) return 0;
            // formats handled: "Xh Ym", "Xm Ys", "Xs", or numeric fallback
            try {
                const hMatch = dur.match(/(\d+)\s*h/);
                const mMatch = dur.match(/(\d+)\s*m/);
                const sMatch = dur.match(/(\d+)\s*s/);
                let seconds = 0;
                if (hMatch) seconds += parseInt(hMatch[1], 10) * 3600;
                if (mMatch) seconds += parseInt(mMatch[1], 10) * 60;
                if (sMatch) seconds += parseInt(sMatch[1], 10);
                if (seconds > 0) return seconds / 3600;
                // fallback: try HH:MM:SS or numeric minutes
                if (dur.includes(':')) {
                    const parts = dur.split(':').map(p => parseInt(p, 10) || 0);
                    // hh:mm:ss or mm:ss
                    if (parts.length === 3) return parts[0] + parts[1] / 60 + parts[2] / 3600;
                    if (parts.length === 2) return parts[0] / 60 + parts[1] / 3600;
                }
                const num = parseFloat(dur);
                if (!isNaN(num)) return num; // assume hours
            } catch { /* ignore */ }
            return 0;
        };

        return tasks.reduce((total, task) => total + toHours(task.duration || ''), 0);
    };

    const handleStartWork = async (task: ScheduledTask) => {
        if (!task.assignmentId) {
            alert('Assignment ID not found.');
            return;
        }

        if (task.status !== 'Scheduled' && task.status !== 'ASSIGNED') {
            alert('This appointment is already in progress or completed.');
            return;
        }

        try {
            // Start time log (creates a new TimeLog)
            const timeLog = await startTimeLog(task.assignmentId, `Started work on ${task.service}`);

            // Update assignment status to IN_PROGRESS on server
            await updateAssignmentStatus(task.assignmentId, 'IN_PROGRESS');

            // Optimistically update local schedule: append new time log and mark in-progress
            setSchedule((prev) => {
                const cloned: { [key: string]: ScheduledTask[] } = {};
                Object.keys(prev).forEach((day) => {
                    cloned[day] = prev[day].map((t) => {
                        if (t.assignmentId === task.assignmentId) {
                            const existingLogs = t.timeLogs ? [...t.timeLogs] : [];
                            const updatedLogs = [...existingLogs, timeLog];
                            return rebuildTaskFromLogs(t, updatedLogs);
                        }
                        return t;
                    });
                });
                return cloned;
            });

            alert(`Started work on: ${task.service}`);
        } catch (error: any) {
            console.error('Error starting work:', error);
            // If server returned 409 (active log exists), refresh logs for this assignment and rebuild task
            if (error?.response?.status === 409 && task.assignmentId) {
                try {
                    const freshLogs = await getTimeLogsForAssignment(task.assignmentId);
                    // sort and rebuild
                    const sorted = freshLogs.sort((a, b) => {
                        const sa = a.startTime ? new Date(a.startTime).getTime() : 0;
                        const sb = b.startTime ? new Date(b.startTime).getTime() : 0;
                        return sa - sb;
                    });
                    setSchedule((prev) => {
                        const cloned: { [key: string]: ScheduledTask[] } = {};
                        Object.keys(prev).forEach((day) => {
                            cloned[day] = prev[day].map((t) => {
                                if (t.assignmentId === task.assignmentId) {
                                    return rebuildTaskFromLogs(t, sorted);
                                }
                                return t;
                            });
                        });
                        return cloned;
                    });
                    alert('An active timer already exists for this assignment. Refreshed logs.');
                    return;
                } catch (e) {
                    console.error('Failed to refresh logs after 409:', e);
                }
            }

            alert('Failed to start work. Please try again.');
        }
    };

    const handleFinishWork = async (task: ScheduledTask) => {
        if (!task.timeLogId) {
            alert('No active time log found.');
            return;
        }

        if (task.status !== 'In Progress' && task.status !== 'IN_PROGRESS') {
            alert('You can only finish tasks that are In Progress.');
            return;
        }

        try {
            // Stop time log (finish current active log)
            const stopped = await stopTimeLog(task.timeLogId);

            // Update assignment status to COMPLETED on server
            if (task.assignmentId) {
                await updateAssignmentStatus(task.assignmentId, 'COMPLETED');
            }

            // Optimistically update local schedule: mark the stopped log's endTime and set status Completed
            setSchedule((prev) => {
                const cloned: { [key: string]: ScheduledTask[] } = {};
                Object.keys(prev).forEach((day) => {
                    cloned[day] = prev[day].map((t) => {
                        if (t.assignmentId === task.assignmentId) {
                            const logs = t.timeLogs ? t.timeLogs.map((l) => l.id === stopped.id ? stopped : l) : [stopped];
                            return rebuildTaskFromLogs(t, logs);
                        }
                        return t;
                    });
                });
                return cloned;
            });

            alert(`Finished work on: ${task.service}`);
        } catch (error) {
            console.error('Error finishing work:', error);
            alert('Failed to finish work. Please try again.');
        }
    };

    const handlePauseWork = async (task: ScheduledTask) => {
        if (!task.timeLogId) {
            alert('No active time log to pause.');
            return;
        }

        if (task.status !== 'In Progress' && task.status !== 'IN_PROGRESS') {
            alert('Can only pause tasks that are In Progress.');
            return;
        }

        try {
            // Stop the active time log (pauses the timer) and get stopped log
            const stopped = await stopTimeLog(task.timeLogId);
            // Update assignment status to PAUSED
            if (task.assignmentId) {
                await updateAssignmentStatus(task.assignmentId, 'PAUSED');
            }

            // Optimistically update local schedule: mark the stopped log's endTime and set status Paused
            setSchedule((prev) => {
                const cloned: { [key: string]: ScheduledTask[] } = {};
                Object.keys(prev).forEach((day) => {
                    cloned[day] = prev[day].map((t) => {
                        if (t.assignmentId === task.assignmentId) {
                            const logs = t.timeLogs ? t.timeLogs.map((l) => l.id === stopped.id ? stopped : l) : [stopped];
                            return rebuildTaskFromLogs(t, logs);
                        }
                        return t;
                    });
                });
                return cloned;
            });

            alert(`Paused work on: ${task.service}`);
        } catch (error) {
            console.error('Error pausing work:', error);
            alert('Failed to pause work. Please try again.');
        }
    };

    const handleResumeWork = async (task: ScheduledTask) => {
        if (!task.assignmentId) {
            alert('Assignment ID not found.');
            return;
        }

        if (task.status !== 'PAUSED') {
            alert('Can only resume tasks that are paused.');
            return;
        }

        try {
            // Start a new time log (resume) and get the created log object
            const newLog = await startTimeLog(task.assignmentId, `Resumed work on ${task.service}`);
            // Update assignment status to IN_PROGRESS
            await updateAssignmentStatus(task.assignmentId, 'IN_PROGRESS');

            // Optimistically update local schedule state to append the new time log as a new line
            setSchedule((prev) => {
                const cloned: { [key: string]: ScheduledTask[] } = {};
                Object.keys(prev).forEach((day) => {
                    cloned[day] = prev[day].map((t) => {
                        if (t.assignmentId === task.assignmentId) {
                            const existingLogs = t.timeLogs ? [...t.timeLogs] : [];
                            const updatedLogs = [...existingLogs, newLog];
                            return rebuildTaskFromLogs(t, updatedLogs);
                        }
                        return t;
                    });
                });
                return cloned;
            });

            alert(`Resumed work on: ${task.service}`);
        } catch (error: any) {
            console.error('Error resuming work:', error);
            // handle 409 same as start: refresh logs
            if (error?.response?.status === 409 && task.assignmentId) {
                try {
                    const freshLogs = await getTimeLogsForAssignment(task.assignmentId);
                    const sorted = freshLogs.sort((a, b) => {
                        const sa = a.startTime ? new Date(a.startTime).getTime() : 0;
                        const sb = b.startTime ? new Date(b.startTime).getTime() : 0;
                        return sa - sb;
                    });
                    setSchedule((prev) => {
                        const cloned: { [key: string]: ScheduledTask[] } = {};
                        Object.keys(prev).forEach((day) => {
                            cloned[day] = prev[day].map((t) => {
                                if (t.assignmentId === task.assignmentId) {
                                    return rebuildTaskFromLogs(t, sorted);
                                }
                                return t;
                            });
                        });
                        return cloned;
                    });
                    alert('An active timer already exists for this assignment. Refreshed logs.');
                    return;
                } catch (e) {
                    console.error('Failed to refresh logs after 409:', e);
                }
            }

            alert('Failed to resume work. Please try again.');
        }
    };

    const handleViewDetails = (task: ScheduledTask) => {
        setSelectedTask(task);
        setShowDetailsModal(true);
    };

    const formatTime = (ts?: number) => {
        if (!ts) return '-';
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatElapsed = (startTs?: number, endTs?: number) => {
        if (!startTs) return '00:00:00';
        const end = endTs ?? Date.now();
        const totalSec = Math.max(0, Math.floor((end - startTs) / 1000));
        const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const ss = String(totalSec % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    };

    const formatSecondsToHuman = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    // Rebuild a ScheduledTask summary from its timeLogs (used for optimistic updates)
    const rebuildTaskFromLogs = (t: ScheduledTask, logs: TimeLogResponse[]): ScheduledTask => {
        let totalSeconds = 0;
        let earliestStart: number | undefined = undefined;
        let latestEnd: number | undefined = undefined;
        let activeLog: TimeLogResponse | undefined = undefined;
        const currentTime = Date.now(); // Use consistent time for active log calculation

        for (const tl of logs) {
            if (!tl || !tl.startTime) continue;
            const s = new Date(tl.startTime).getTime();
            const e = tl.endTime ? new Date(tl.endTime).getTime() : undefined;
            
            if (!earliestStart || s < earliestStart) earliestStart = s;
            if (e && (!latestEnd || e > latestEnd)) latestEnd = e;
            
            // Calculate duration for this log entry
            if (e) {
                // Completed log: duration from start to end
                totalSeconds += Math.max(0, Math.floor((e - s) / 1000));
            } else {
                // Active log: duration from start to now (will update on next tick)
                activeLog = tl;
                totalSeconds += Math.max(0, Math.floor((currentTime - s) / 1000));
            }
        }

        const durationStr = totalSeconds > 0 ? formatSecondsToHuman(totalSeconds) : (t.duration || 'N/A');

        return {
            ...t,
            timeLogs: logs.sort((a, b) => {
                // Sort by start time (oldest first)
                const sa = a.startTime ? new Date(a.startTime).getTime() : 0;
                const sb = b.startTime ? new Date(b.startTime).getTime() : 0;
                return sa - sb;
            }),
            timeLogId: activeLog ? activeLog.id : undefined,
            status: activeLog ? 'In Progress' : (t.status === 'COMPLETED' ? 'COMPLETED' : (logs && logs.length > 0 ? 'PAUSED' : t.status)),
            startTimestamp: activeLog?.startTime ? new Date(activeLog.startTime).getTime() : earliestStart,
            endTimestamp: activeLog?.endTime ? new Date(activeLog.endTime).getTime() : latestEnd,
            duration: durationStr
        } as ScheduledTask;
    };

    // helper: build render order based on focusedDay and hide/show empty days
    const weekOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const renderDays = (() => {
        const base = focusedDay ? [focusedDay, ...weekOrder.filter(d => d !== focusedDay)] : weekOrder.slice();
        if (!showEmptyDays) {
            return base.filter(d => schedule[d] && schedule[d].length > 0);
        }
        return base;
    })();

    const jumpToToday = () => {
        try {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
            setFocusedDay(today);
        } catch (e) {
            // ignore
        }
    };

    if (!userRole) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Checking permissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            {/* Hidden binding to satisfy linter: ensures tick is used while remaining invisible */}
            <span className="hidden" aria-hidden>{tick}</span>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Schedule</h1>
                    <p className="text-gray-400">View your weekly schedule and appointments</p>
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            onClick={jumpToToday}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm border border-gray-700"
                        >
                            Jump to Today
                        </button>
                        <button
                            onClick={() => setShowEmptyDays(s => !s)}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md text-sm border border-gray-700"
                        >
                            {showEmptyDays ? 'Hide Empty Days' : 'Show Empty Days'}
                        </button>
                        {focusedDay && (
                            <div className="ml-3 text-sm text-gray-300">Showing: <span className="font-semibold text-white">{focusedDay}</span></div>
                        )}
                    </div>
                </div>

                {/* Weekly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Appointments</p>
                        <p className="text-3xl font-bold text-white mt-2">
                            {Object.values(schedule).flat().length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">This Week</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">
                            {Object.values(schedule).flat().length}
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Total Time</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">
                            {getTotalTime(Object.values(schedule).flat())} hrs
                        </p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <p className="text-gray-400 text-sm">Available Hours</p>
                        <p className="text-3xl font-bold text-purple-500 mt-2">40h</p>
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                            <p className="text-gray-400 mt-4">Loading schedule...</p>
                        </div>
                    ) : renderDays.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-lg">No appointments scheduled for this week.</p>
                            <p className="text-sm mt-2">Try toggling "Show Empty Days" or check another week.</p>
                        </div>
                    ) : (
                        renderDays.map((day) => (
                        <div key={day} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">{day}</h2>
                                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm font-semibold">
                                        {schedule[day]?.length || 0} appointments
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {!schedule[day] || schedule[day].length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-2 opacity-50">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-16 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                        <p>No appointments scheduled for {day}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {schedule[day].map((task) => (
                                            <div key={task.id} className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-cyan-500/50 transition">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                                {task.time.split(' ')[0].split(':')[0]}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-white font-semibold text-lg">{task.service}</h3>
                                                                <p className="text-gray-400 text-sm">{task.customerName} • {task.vehicle}</p>
                                                            </div>
                                                        </div>
                                                            {/* Time Logs Display */}
                                                            {task.timeLogs && task.timeLogs.length > 0 ? (() => {
                                                                // Recalculate total duration for live updates (especially for active logs)
                                                                let totalSeconds = 0;
                                                                task.timeLogs?.forEach((tl) => {
                                                                    if (!tl.startTime) return;
                                                                    const startTime = new Date(tl.startTime).getTime();
                                                                    const endTime = tl.endTime ? new Date(tl.endTime).getTime() : undefined;
                                                                    if (endTime) {
                                                                        totalSeconds += Math.max(0, Math.floor((endTime - startTime) / 1000));
                                                                    } else {
                                                                        // Active log - use current time
                                                                        totalSeconds += Math.max(0, Math.floor((Date.now() - startTime) / 1000));
                                                                    }
                                                                });
                                                                const totalDurationStr = totalSeconds > 0 ? formatSecondsToHuman(totalSeconds) : '0s';
                                                                
                                                                return (
                                                                <div className="mt-4 space-y-2">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <p className="text-gray-400 text-sm font-semibold">Time Logs</p>
                                                                        <p className="text-white text-sm font-bold">
                                                                            Total: {totalDurationStr}
                                                                        </p>
                                                                    </div>
                                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                        {task.timeLogs.map((tl, idx) => {
                                                                            const startTime = tl.startTime ? new Date(tl.startTime).getTime() : undefined;
                                                                            const endTime = tl.endTime ? new Date(tl.endTime).getTime() : undefined;
                                                                            const isActive = !endTime;
                                                                            
                                                                            // Calculate elapsed duration for this log
                                                                            // Use tick to force re-render for active logs (updates every second)
                                                                            let elapsedSeconds = 0;
                                                                            if (startTime) {
                                                                                const end = endTime || Date.now(); // Current time for active logs
                                                                                elapsedSeconds = Math.max(0, Math.floor((end - startTime) / 1000));
                                                                            }
                                                                            
                                                                            return (
                                                                                <div 
                                                                                    key={tl.id || idx} 
                                                                                    className={`bg-gray-900 rounded-lg border p-3 ${
                                                                                        isActive ? 'border-yellow-500/50' : 'border-gray-700'
                                                                                    }`}
                                                                                >
                                                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                                                        <div>
                                                                                            <p className="text-gray-500 mb-1">Start</p>
                                                                                            <p className="text-white font-medium">
                                                                                                {startTime ? formatTime(startTime) : '-'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-gray-500 mb-1">End</p>
                                                                                            <p className={`font-medium ${isActive ? 'text-yellow-400' : 'text-white'}`}>
                                                                                                {endTime ? formatTime(endTime) : (isActive ? 'In Progress' : '-')}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="text-gray-500 mb-1">Elapsed</p>
                                                                                            <p className={`font-semibold ${isActive ? 'text-yellow-400' : 'text-white'}`}>
                                                                                                {elapsedSeconds > 0 
                                                                                                    ? formatSecondsToHuman(elapsedSeconds)
                                                                                                    : '-'
                                                                                                }
                                                                                                {isActive && ' (active)'}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                );
                                                            })() : (
                                                                <div className="mt-4 bg-gray-900 rounded-lg border border-gray-700 p-3 text-sm">
                                                                    <p className="text-gray-500">No time logs yet. Click "Start Work" to begin tracking.</p>
                                                            </div>
                                                            )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-gray-400 text-sm">Duration</p>
                                                            <p className="text-white font-semibold">{task.duration}</p>
                                                        </div>
                                                            {(task.status === 'In Progress' || task.status === 'IN_PROGRESS') && (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                                                                    In Progress
                                                                </span>
                                                            )}
                                                            {(task.status === 'Scheduled' || task.status === 'ASSIGNED') && (
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/20 text-blue-400">
                                                                    Scheduled
                                                                </span>
                                                            )}
                                                            {task.status === 'COMPLETED' && (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                                                                    Completed
                                                                </span>
                                                            )}
                                                            {task.status === 'PAUSED' && (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500/20 text-orange-400">
                                                                    Paused
                                                        </span>
                                                            )}
                                                        </div>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                        {task.status === 'In Progress' || task.status === 'IN_PROGRESS' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handlePauseWork(task)}
                                                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition text-sm"
                                                                >
                                                                    Pause
                                                                </button>
                                                        <button 
                                                            onClick={() => handleFinishWork(task)}
                                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition text-sm"
                                                        >
                                                            Finish Work
                                                        </button>
                                                            </>
                                                        ) : task.status === 'PAUSED' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleResumeWork(task)}
                                                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition text-sm"
                                                                >
                                                                    Resume Work
                                                                </button>
                                                            </>
                                                        ) : task.status === 'Scheduled' || task.status === 'ASSIGNED' ? (
                                                        <button 
                                                            onClick={() => handleStartWork(task)}
                                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition text-sm"
                                                        >
                                                            Start Work
                                                        </button>
                                                        ) : (
                                                            <button 
                                                                disabled
                                                                className="flex-1 px-4 py-2 bg-gray-600 text-gray-400 font-semibold rounded-lg cursor-not-allowed text-sm"
                                                            >
                                                                {task.status === 'COMPLETED' ? 'Completed' : task.status}
                                                            </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleViewDetails(task)}
                                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition text-sm"
                                                    >
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Appointment ID</p>
                                    <p className="text-white font-semibold">{selectedTask.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Status</p>
                                    <p className="text-white font-semibold">{selectedTask.status}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Service</p>
                                <p className="text-white font-semibold">{selectedTask.service}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Customer</p>
                                    <p className="text-white font-semibold">{selectedTask.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                                    <p className="text-white font-semibold">{selectedTask.vehicle}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Scheduled</p>
                                    <p className="text-white font-semibold">{selectedTask.time}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Start</p>
                                    <p className="text-white font-semibold">{formatTime(selectedTask.startTimestamp)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">End</p>
                                    <p className="text-white font-semibold">{formatTime(selectedTask.endTimestamp)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Elapsed</p>
                                <p className="text-white font-semibold">{formatElapsed(selectedTask.startTimestamp, selectedTask.endTimestamp)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Total Duration</p>
                                <p className="text-white font-semibold">{selectedTask.duration}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Time Log History</p>
                                <div className="text-white text-sm mt-2 space-y-2">
                                    {selectedTask.timeLogs && selectedTask.timeLogs.length > 0 ? (
                                        selectedTask.timeLogs.map((tl) => {
                                            const s = tl.startTime ? new Date(tl.startTime).getTime() : undefined;
                                            const e = tl.endTime ? new Date(tl.endTime).getTime() : undefined;
                                            const durSec = s ? Math.max(0, Math.floor(((e ?? Date.now()) - s) / 1000)) : 0;
                                            return (
                                                <div key={tl.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-gray-300">Start: <span className="text-white">{formatTime(s)}</span></div>
                                                            <div className="text-gray-300">End: <span className="text-white">{formatTime(e)}</span></div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-gray-300">Duration</div>
                                                            <div className="text-white font-semibold">{formatSecondsToHuman(durSec)} {e ? '' : '(active)'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-gray-400">No time logs recorded for this assignment.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
