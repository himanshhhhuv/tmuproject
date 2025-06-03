import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const HODEventsPage = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;

  // Get event statistics
  const totalEvents = await prisma.event.count();
  const upcomingEvents = await prisma.event.count({
    where: { 
      startTime: { 
        gte: new Date() 
      } 
    }
  });
  const pastEvents = await prisma.event.count({
    where: { 
      startTime: { 
        lt: new Date() 
      } 
    }
  });

  // Get recent events for department oversight
  const recentEvents = await prisma.event.findMany({
    include: {
      class: { select: { name: true } },
    },
    take: 8,
    orderBy: { startTime: "desc" }
  });

  // Get events by class/department
  const eventsByClass = await prisma.event.groupBy({
    by: ['classId'],
    _count: {
      id: true
    },
    where: {
      classId: { not: null }
    }
  });

  const classData = await prisma.class.findMany({
    where: {
      id: {
        in: eventsByClass.map(e => e.classId).filter(Boolean) as number[]
      }
    },
    select: { id: true, name: true }
  });

  const eventsWithClassNames = eventsByClass.map(event => ({
    ...event,
    className: classData.find(c => c.id === event.classId)?.name || 'Unknown'
  }));

  return (
    <div className="p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">HOD - Department Event Management</h1>
          <p className="text-gray-600">Departmental event oversight and coordination</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/list/events" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            All Events
          </Link>
          <Link 
            href="/list/event-reports" 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Submit Report
          </Link>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Department Events</p>
              <p className="text-3xl font-bold">{totalEvents}</p>
              <p className="text-indigo-100 text-sm">All time</p>
            </div>
            <Image src="/calendar.png" alt="" width={40} height={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Upcoming Events</p>
              <p className="text-3xl font-bold">{upcomingEvents}</p>
              <p className="text-green-100 text-sm">This month</p>
            </div>
            <Image src="/calendar.png" alt="" width={40} height={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Faculty Participation</p>
              <p className="text-3xl font-bold">85%</p>
              <p className="text-purple-100 text-sm">Active involvement</p>
            </div>
            <Image src="/teacher.png" alt="" width={40} height={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Reports Pending</p>
              <p className="text-3xl font-bold">3</p>
              <p className="text-orange-100 text-sm">To submit</p>
            </div>
            <Image src="/result.png" alt="" width={40} height={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT DEPARTMENTAL EVENTS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Departmental Events</h3>
            <Link href="/list/events" className="text-blue-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 rounded-full">
                      <Image src="/calendar.png" alt="" width={20} height={20} />
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {event.class?.name || 'All Classes'} • {' '}
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        }).format(event.startTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.startTime > new Date() 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.startTime > new Date() ? 'Upcoming' : 'Completed'}
                    </span>
                    <button className="text-blue-600 text-sm hover:underline">
                      Manage
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image src="/calendar.png" alt="" width={48} height={48} className="mx-auto mb-4 opacity-50" />
                <p>No recent departmental events</p>
              </div>
            )}
          </div>
        </div>

        {/* DEPARTMENT BREAKDOWN */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Events by Class</h3>
          
          <div className="space-y-4">
            {eventsWithClassNames.length > 0 ? (
              eventsWithClassNames.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.className}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full" 
                        style={{ 
                          width: `${totalEvents > 0 ? (item._count.id / totalEvents) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{item._count.id}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No class-specific events yet</p>
            )}
          </div>
        </div>
      </div>

      {/* FACULTY COORDINATION */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Faculty Event Coordination</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FACULTY ASSIGNMENTS */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/teacher.png" alt="" width={24} height={24} />
              <h4 className="font-medium text-blue-800">Faculty Assignments</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-2">12</p>
            <p className="text-sm text-blue-600">Active event coordinators</p>
            <button className="mt-3 text-blue-600 text-sm hover:underline">
              Manage Assignments
            </button>
          </div>

          {/* STUDENT PARTICIPATION */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/student.png" alt="" width={24} height={24} />
              <h4 className="font-medium text-green-800">Student Participation</h4>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-2">78%</p>
            <p className="text-sm text-green-600">Average attendance rate</p>
            <button className="mt-3 text-green-600 text-sm hover:underline">
              View Details
            </button>
          </div>

          {/* BUDGET TRACKING */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Image src="/finance.png" alt="" width={24} height={24} />
              <h4 className="font-medium text-yellow-800">Budget Utilization</h4>
            </div>
            <p className="text-2xl font-bold text-yellow-600 mb-2">65%</p>
            <p className="text-sm text-yellow-600">Of allocated budget used</p>
            <button className="mt-3 text-yellow-600 text-sm hover:underline">
              Budget Report
            </button>
          </div>
        </div>
      </div>

      {/* HOD ACTIONS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">HOD Actions & Reports</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/list/event-reports"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-2">
              <Image src="/result.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Submit Report</span>
            <span className="text-xs text-gray-500">To Principal</span>
          </Link>

          <Link 
            href="/list/events"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-green-100 rounded-full mb-2">
              <Image src="/calendar.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Create Event</span>
            <span className="text-xs text-gray-500">Department event</span>
          </Link>

          <Link 
            href="/list/eventdocs"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-2">
              <Image src="/upload.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Documents</span>
            <span className="text-xs text-gray-500">Event files</span>
          </Link>

          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-3 bg-orange-100 rounded-full mb-2">
              <Image src="/teacher.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Faculty Roster</span>
            <span className="text-xs text-gray-500">Event assignments</span>
          </button>
        </div>
      </div>

      {/* UPCOMING SUBMISSIONS */}
      <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <Image src="/announcement.png" alt="" width={24} height={24} />
          <div>
            <h3 className="font-semibold text-orange-800 mb-2">Upcoming Report Submissions</h3>
            <div className="space-y-2 text-sm text-orange-700">
              <div className="flex justify-between items-center">
                <span>• Annual Sports Day Report</span>
                <span className="text-xs bg-orange-200 px-2 py-1 rounded">Due: Dec 15</span>
              </div>
              <div className="flex justify-between items-center">
                <span>• Faculty Development Workshop Report</span>
                <span className="text-xs bg-orange-200 px-2 py-1 rounded">Due: Dec 20</span>
              </div>
              <div className="flex justify-between items-center">
                <span>• Department Budget Utilization</span>
                <span className="text-xs bg-orange-200 px-2 py-1 rounded">Due: Dec 25</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DEPARTMENT GUIDELINES */}
      <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <Image src="/announcement.png" alt="" width={24} height={24} />
          <div>
            <h3 className="font-semibold text-indigo-800 mb-2">Department Event Guidelines</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• All departmental events must be approved 2 weeks in advance</li>
              <li>• Faculty participation is mandatory for major department events</li>
              <li>• Post-event reports must include attendance and budget details</li>
              <li>• Inter-departmental events require coordination with other HODs</li>
              <li>• Student safety protocols must be documented and followed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODEventsPage;
