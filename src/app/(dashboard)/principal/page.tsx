import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import Image from "next/image";

const PrincipalPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
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
                <h2 className="text-lg font-semibold text-gray-600">Total Events</h2>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <Image src="/calendar.png" alt="" width={32} height={32} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">Pending Reports</h2>
                <p className="text-2xl font-bold text-orange-600">8</p>
              </div>
              <Image src="/result.png" alt="" width={32} height={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">Budget Alerts</h2>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <Image src="/finance.png" alt="" width={32} height={32} />
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/calendar.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Approve Events</span>
            </button>
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/result.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Review Reports</span>
            </button>
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/finance.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Budget Overview</span>
            </button>
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/setting.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">System Settings</span>
            </button>
          </div>
        </div>

        {/* RECENT ACTIVITIES */}
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border-l-4 border-blue-500 bg-blue-50">
              <Image src="/calendar.png" alt="" width={20} height={20} />
              <div>
                <p className="text-sm font-medium">New event proposal submitted</p>
                <p className="text-xs text-gray-500">Annual Science Fair - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 border-l-4 border-orange-500 bg-orange-50">
              <Image src="/result.png" alt="" width={20} height={20} />
              <div>
                <p className="text-sm font-medium">Event report pending review</p>
                <p className="text-xs text-gray-500">Sports Day Report - 4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 border-l-4 border-red-500 bg-red-50">
              <Image src="/finance.png" alt="" width={20} height={20} />
              <div>
                <p className="text-sm font-medium">Budget exceeded alert</p>
                <p className="text-xs text-gray-500">Cultural Week - 6 hours ago</p>
              </div>
            </div>
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
