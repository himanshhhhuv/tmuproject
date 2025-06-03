import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const PrincipalEventsPage = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;

  // Get event statistics
  const totalEvents = await prisma.event.count();
  const pendingEvents = await prisma.event.count({
    where: { approvalStatus: "PENDING" },
  });
  const rejectedEvents = await prisma.event.count({
    where: { approvalStatus: "REJECTED" },
  });
  const approvedEvents = await prisma.event.count({
    where: { approvalStatus: "APPROVED" },
  });

  // Get recent events for approval/oversight
  const recentEvents = await prisma.event.findMany({
    include: {
      class: { select: { name: true } },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  // Get events by class/department
  const eventsByClass = await prisma.event.groupBy({
    by: ["classId"],
    _count: {
      id: true,
    },
    where: {
      classId: { not: null },
    },
  });

  const classData = await prisma.class.findMany({
    where: {
      id: {
        in: eventsByClass.map((e) => e.classId).filter(Boolean) as number[],
      },
    },
    select: { id: true, name: true },
  });

  const eventsWithClassNames = eventsByClass.map((event) => ({
    ...event,
    className: classData.find((c) => c.id === event.classId)?.name || "Unknown",
  }));

  return (
    <div className="p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Principal - Event Oversight</h1>
          <p className="text-gray-600">
            Institutional event management and approvals
          </p>
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
            Event Reports
          </Link>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Events</p>
              <p className="text-3xl font-bold">{totalEvents}</p>
              <p className="text-blue-100 text-sm">All time</p>
            </div>
            <Image
              src="/calendar.png"
              alt=""
              width={40}
              height={40}
              className="opacity-80"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Pending Events</p>
              <p className="text-3xl font-bold">{pendingEvents}</p>
              <p className="text-green-100 text-sm">Awaiting approval</p>
            </div>
            <Image
              src="/calendar.png"
              alt=""
              width={40}
              height={40}
              className="opacity-80"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Approved Events</p>
              <p className="text-3xl font-bold">{approvedEvents}</p>
              <p className="text-green-100 text-sm">Approved events</p>
            </div>
            <Image
              src="/calendar.png"
              alt=""
              width={40}
              height={40}
              className="opacity-80"
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Rejected Events</p>
              <p className="text-3xl font-bold">{rejectedEvents}</p>
              <p className="text-orange-100 text-sm">Rejected by principal</p>
            </div>
            <Image
              src="/finance.png"
              alt=""
              width={40}
              height={40}
              className="opacity-80"
            />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT EVENTS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Events</h3>
            <Link
              href="/list/events"
              className="text-blue-600 text-sm hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Image
                        src="/calendar.png"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-500">
                        {event.class?.name || "All Classes"} •{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(event.startTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.startTime > new Date()
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {/* {event.startTime > new Date() ? "Pending" : "Completed"} */}
                    </span>
                      {/* <button className="text-blue-600 text-sm hover:underline">
                        Review
                      </button> */}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image
                  src="/calendar.png"
                  alt=""
                  width={48}
                  height={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p>No recent events</p>
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
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            totalEvents > 0
                              ? (item._count.id / totalEvents) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {item._count.id}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No class-specific events yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* APPROVAL ACTIONS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Principal Actions</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/list/event-reports"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-2">
              <Image src="/result.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Review Reports</span>
            <span className="text-xs text-gray-500">Event analysis</span>
          </Link>

          {/* <Link 
            href="/list/event-hotspots"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-red-100 rounded-full mb-2">
              <Image src="/announcement.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Hotspots</span>
            <span className="text-xs text-gray-500">Critical issues</span>
          </Link> */}

          <Link
            href="/list/eventdocs"
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-3 bg-green-100 rounded-full mb-2">
              <Image src="/upload.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Documents</span>
            <span className="text-xs text-gray-500">Event files</span>
          </Link>

          {/* <button className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-3 bg-purple-100 rounded-full mb-2">
              <Image src="/setting.png" alt="" width={24} height={24} />
            </div>
            <span className="text-sm font-medium">Policy Settings</span>
            <span className="text-xs text-gray-500">Event policies</span>
          </button> */}
        </div>
      </div>

      {/* POLICY GUIDELINES */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <Image src="/announcement.png" alt="" width={24} height={24} />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">
              Principal Event Management Guidelines
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • All major institutional events require principal approval
              </li>
              <li>
                • Budget allocations above ₹50,000 need documented justification
              </li>
              <li>• Post-event reports must be submitted within 48 hours</li>
              <li>
                • Safety protocols must be followed for all outdoor events
              </li>
              <li>• Inter-departmental events require coordination approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalEventsPage;
