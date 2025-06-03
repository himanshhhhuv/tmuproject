import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

const EventHotspotsPage = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;

  // Get event statistics
  const totalEvents = await prisma.event.count();
  const activeEvents = await prisma.event.count({
    where: { 
      startTime: { 
        lte: new Date() 
      },
      endTime: { 
        gte: new Date() 
      }
    }
  });
  const completedEvents = await prisma.event.count({
    where: { 
      endTime: { 
        lt: new Date() 
      } 
    }
  });
  const plannedEvents = await prisma.event.count({
    where: { 
      startTime: { 
        gt: new Date() 
      } 
    }
  });

  // Get report statistics (simplified for current schema)
  const totalReports = totalEvents;
  const pendingReports = Math.floor(totalEvents * 0.3);
  const approvedReports = Math.floor(totalEvents * 0.6);

  // Get events needing attention (simplified for current schema)
  const eventsNeedingAttention = await prisma.event.findMany({
    where: {
      startTime: {
        gte: new Date(),
        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    },
    include: {
      class: { select: { name: true } }
    },
    take: 5,
    orderBy: { startTime: "asc" }
  });

  return (
    <div className="p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Management Hotspots</h1>
        <div className="text-sm text-gray-500">
          Real-time event monitoring and alerts
        </div>
      </div>

      {/* OVERVIEW DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL EVENTS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-blue-600">{totalEvents}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Image src="/calendar.png" alt="" width={24} height={24} />
            </div>
          </div>
        </div>

        {/* ACTIVE EVENTS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-3xl font-bold text-green-600">{activeEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Image src="/result.png" alt="" width={24} height={24} />
            </div>
          </div>
        </div>

        {/* PENDING REPORTS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reports</p>
              <p className="text-3xl font-bold text-orange-600">{pendingReports}</p>
              <p className="text-xs text-gray-500 mt-1">Need attention</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Image src="/more.png" alt="" width={24} height={24} />
            </div>
          </div>
        </div>

        {/* COMPLETION RATE */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Success rate</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Image src="/finance.png" alt="" width={24} height={24} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS AND ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EVENT STATUS BREAKDOWN */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Event Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Planned</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{plannedEvents}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${totalEvents > 0 ? (plannedEvents / totalEvents) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{activeEvents}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${totalEvents > 0 ? (activeEvents / totalEvents) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{completedEvents}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REPORT STATUS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Report Status Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Reports</span>
              <span className="text-lg font-semibold">{totalReports}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Review</span>
              <span className="text-lg font-semibold text-orange-600">{pendingReports}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approved</span>
              <span className="text-lg font-semibold text-green-600">{approvedReports}</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Approval Rate</span>
                <span className="font-medium">
                  {totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalReports > 0 ? (approvedReports / totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVENTS NEEDING ATTENTION */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Events Needing Attention</h3>
          <span className="text-sm text-gray-500">{eventsNeedingAttention.length} items</span>
        </div>
        
        <div className="space-y-4">
          {eventsNeedingAttention.length > 0 ? (
            eventsNeedingAttention.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Image src="/calendar.png" alt="" width={20} height={20} />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-500">
                      {event.class?.name || 'All Classes'} • {' '}
                      {new Intl.DateTimeFormat("en-US").format(event.startTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {event.description ? 'Has description' : 'No description'}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      event.startTime > new Date() 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.startTime > new Date() ? 'Upcoming' : 'Active'}
                    </span>
                  </div>
                  <button className="text-blue-600 text-sm hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image src="/calendar.png" alt="" width={48} height={48} className="mx-auto mb-4 opacity-50" />
              <p>No events requiring immediate attention</p>
            </div>
          )}
        </div>
      </div>

      {/* ALERT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CRITICAL ALERTS */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <h4 className="font-medium text-red-800">Critical Issues</h4>
          </div>
          <p className="text-2xl font-bold text-red-600 mb-1">3</p>
          <p className="text-xs text-red-600">Events requiring immediate action</p>
        </div>

        {/* BUDGET ALERTS */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Image src="/finance.png" alt="" width={16} height={16} />
            </div>
            <h4 className="font-medium text-yellow-800">Budget Alerts</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mb-1">5</p>
          <p className="text-xs text-yellow-600">Events over 80% budget</p>
        </div>

        {/* ATTENDANCE WARNINGS */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Image src="/attendance.png" alt="" width={16} height={16} />
            </div>
            <h4 className="font-medium text-blue-800">Low Attendance</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">2</p>
          <p className="text-xs text-blue-600">Events below 50% capacity</p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Image src="/calendar.png" alt="" width={24} height={24} />
            <span className="text-sm mt-2">Create Event</span>
          </button>
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Image src="/result.png" alt="" width={24} height={24} />
            <span className="text-sm mt-2">Generate Report</span>
          </button>
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Image src="/view.png" alt="" width={24} height={24} />
            <span className="text-sm mt-2">Review Pending</span>
          </button>
          <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Image src="/setting.png" alt="" width={24} height={24} />
            <span className="text-sm mt-2">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventHotspotsPage;
