import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import Image from "next/image";

const HODPage = ({
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
          <h1 className="text-2xl font-bold">HOD Dashboard</h1>
          <div className="flex items-center gap-4">
            <Image src="/profile.png" alt="Profile" width={24} height={24} />
            <span className="text-sm text-gray-500">Computer Science Department</span>
          </div>
        </div>

        {/* DEPARTMENT OVERVIEW */}
        <div className="flex gap-4 justify-between flex-wrap">
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">Dept Events</h2>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <Image src="/calendar.png" alt="" width={32} height={32} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">Faculty Assigned</h2>
                <p className="text-2xl font-bold text-green-600">18</p>
              </div>
              <Image src="/teacher.png" alt="" width={32} height={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-md flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-600">Reports Due</h2>
                <p className="text-2xl font-bold text-orange-600">5</p>
              </div>
              <Image src="/result.png" alt="" width={32} height={32} />
            </div>
          </div>
        </div>

        {/* DEPARTMENT ACTIONS */}
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Department Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/calendar.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Plan Events</span>
            </button>
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/teacher.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Assign Faculty</span>
            </button>
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/result.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Submit Reports</span>
            </button>
            <button className="flex flex-col items-center p-4 border rounded-md hover:bg-gray-50">
              <Image src="/finance.png" alt="" width={24} height={24} />
              <span className="text-sm mt-2">Budget Track</span>
            </button>
          </div>
        </div>

        {/* ONGOING EVENTS */}
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Ongoing Department Events</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <Image src="/calendar.png" alt="" width={24} height={24} />
                <div>
                  <h3 className="font-medium">Tech Symposium 2025</h3>
                  <p className="text-sm text-gray-500">Status: In Progress</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Active</span>
                <button className="text-blue-600 text-sm">View Details</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <Image src="/calendar.png" alt="" width={24} height={24} />
                <div>
                  <h3 className="font-medium">Coding Competition</h3>
                  <p className="text-sm text-gray-500">Status: Planning</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Planning</span>
                <button className="text-blue-600 text-sm">View Details</button>
              </div>
            </div>
          </div>
        </div>

        {/* FACULTY PERFORMANCE */}
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Faculty Event Participation</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Dr. Smith (Event Coordinator)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <span className="text-sm text-gray-600">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Prof. Johnson (Technical Lead)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }}></div>
                </div>
                <span className="text-sm text-gray-600">70%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dr. Williams (Student Coordinator)</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <span className="text-sm text-gray-600">60%</span>
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

export default HODPage;
