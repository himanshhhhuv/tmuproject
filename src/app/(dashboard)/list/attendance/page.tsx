import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Table from "@/components/Table";
import FormContainer from "@/components/FormContainer";

const AttendancePage = async () => {
  const user = await currentUser();
  
 const role = user?.publicMetadata.role as string;

  // Fetch attendance data with related information
  const attendances = await prisma.attendance.findMany({
    include: {
      student: {
        select: {
          name: true,
          surname: true,
          class: {
            select: {
              name: true,
            },
          },
        },
      },
      lesson: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  });

  const columns = [
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Lesson",
      accessor: "lesson",
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Status",
      accessor: "status",
    },
    ...(role === "admin"
      ? [
          {
            header: "Actions",
            accessor: "actions",
          },
        ]
      : []),
  ];

  const renderRow = (attendance: any) => (
    <tr key={attendance.id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4">
        {attendance.student.name} {attendance.student.surname}
      </td>
      <td className="p-4">{attendance.student.class.name}</td>
      <td className="p-4">{attendance.lesson.name}</td>
      <td className="p-4">
        {new Intl.DateTimeFormat('en-GB').format(attendance.date)}
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-sm ${
          attendance.present 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {attendance.present ? 'Present' : 'Absent'}
        </span>
      </td>
      {role === "admin" && (
        <td className="p-4">
          <div className="flex items-center gap-2">
            <FormContainer table="attendance" type="update" data={attendance} />
            <FormContainer table="attendance" type="delete" id={attendance.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="p-4">
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Attendance Records</h1>
          {role === "admin" && (
            <FormContainer table="attendance" type="create" />
          )}
        </div>
        <Table 
          columns={columns} 
          data={attendances}
          renderRow={renderRow}
        />
      </div>
    </div>
  );
};

export default AttendancePage;
