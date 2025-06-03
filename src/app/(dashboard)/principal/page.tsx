import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import Image from "next/image";
import prisma from "@/lib/prisma";

const PrincipalPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  // Fetch event statistics
  const totalEvents = await prisma.event.count();
  const pendingEvents = await prisma.event.count({
    where: { approvalStatus: "PENDING" },
  });
  const approvedEvents = await prisma.event.count({
    where: { approvalStatus: "APPROVED" },
  });
  const rejectedEvents = await prisma.event.count({
    where: { approvalStatus: "REJECTED" },
  });

  // Fetch recent events
  const recentEvents = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      startTime: true,
      approvalStatus: true,
    },
  });

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Principal Dashboard</h1>
          <div className="flex items-center gap-4">
            <Image src="/profile.png" alt="Profile" width={24} height={24} />
            <span className="text-sm text-gray-500">Welcome, Principal</span>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">
                  Total Events
                </h2>
                <p className="text-2xl font-bold text-blue-600">
                  {totalEvents}
                </p>
              </div>
              <Image src="/calendar.png" alt="" width={32} height={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">
                  Pending Events
                </h2>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingEvents}
                </p>
              </div>
              <Image src="/calendar.png" alt="" width={32} height={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">
                  Approved Events
                </h2>
                <p className="text-2xl font-bold text-green-600">
                  {approvedEvents}
                </p>
              </div>
              <Image src="/calendar.png" alt="" width={32} height={32} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">
                  Rejected Events
                </h2>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedEvents}
                </p>
              </div>
              <Image src="/finance.png" alt="" width={32} height={32} />
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
          <div className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 border-l-4 border-blue-500 bg-blue-50"
                >
                  <Image src="/calendar.png" alt="" width={20} height={20} />
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(event.startTime))}{" "}
                      - {event.approvalStatus}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No recent events</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default PrincipalPage;
