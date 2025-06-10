import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import EventReportViewModal from "@/components/EventReportViewModal";
import EventReportDownload from "@/components/EventReportDownload";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { EventReport, Prisma } from "@prisma/client";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";

type EventReportList = EventReport & {
  event: {
    id: number;
    title: string;
  };
};

const EventReportListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { page, ...queryParams } = searchParams;
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;

  const p = page ? parseInt(page) : 1;

  // Columns for the table
  const columns = [
    {
      header: "Report Title",
      accessor: "title",
    },
    {
      header: "Event",
      accessor: "event",
      className: "hidden md:table-cell",
    },
    {
      header: "Type",
      accessor: "reportType",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden lg:table-cell",
    },
    {
      header: "Created",
      accessor: "createdAt",
      className: "hidden lg:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: EventReportList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded">
            <Image src="/result.png" alt="" width={20} height={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-xs text-gray-500">Report ID: {item.id}</p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        <p className="text-sm">{item.event.title}</p>
      </td>
      <td className="hidden md:table-cell p-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.reportType.replace('_', ' ')}
        </span>
      </td>
      <td className="hidden lg:table-cell p-4">
        <span 
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
            item.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
            item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}
        >
          {item.status}
        </span>
      </td>
      <td className="hidden lg:table-cell p-4">
        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <EventReportViewModal report={item} />
          <EventReportDownload report={item} />
          {(role === "admin" || role === "principal" || role === "hod" || role === "teacher") && (
            <FormContainer table="eventReport" type="update" data={item} />
          )}
          {(role === "admin" || role === "principal") && (
            <FormContainer table="eventReport" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.EventReportWhereInput = {};

  if (queryParams?.search) {
    query.OR = [
      { title: { contains: queryParams.search, mode: "insensitive" } },
      { content: { contains: queryParams.search, mode: "insensitive" } },
      { event: { title: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.eventReport.findMany({
      where: query,
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.eventReport.count({ where: query }),
  ]);

  // Get events for the form
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  // Get report statistics
  const reportStats = await prisma.eventReport.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const typeStats = await prisma.eventReport.groupBy({
    by: ['reportType'],
    _count: {
      reportType: true,
    },
  });

  const draftCount = reportStats.find(s => s.status === 'DRAFT')?._count.status || 0;
  const submittedCount = reportStats.find(s => s.status === 'SUBMITTED')?._count.status || 0;
  const approvedCount = reportStats.find(s => s.status === 'APPROVED')?._count.status || 0;
  const rejectedCount = reportStats.find(s => s.status === 'REJECTED')?._count.status || 0;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Event Reports</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "principal" || role === "hod" || role === "teacher") && (
              <FormContainer table="eventReport" type="create" data={{ events }} />
            )}
          </div>
        </div>
      </div>
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Total Reports</h3>
          <p className="text-2xl font-bold text-blue-600">{count}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Draft Reports</h3>
          <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Approved Reports</h3>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
          <p className="text-2xl font-bold text-red-600">{submittedCount}</p>
        </div>
      </div>

      {/* REPORT TYPE BREAKDOWN */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Image src="/result.png" alt="" width={20} height={20} />
          <h3 className="font-medium text-gray-800">Report Types Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {typeStats.map((stat) => (
            <div key={stat.reportType} className="bg-white p-2 rounded text-center">
              <p className="text-xs font-medium text-gray-600">{stat.reportType.replace('_', ' ')}</p>
              <p className="text-lg font-bold text-gray-800">{stat._count.reportType}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE NOTICE */}
      <div className="bg-green-50 border border-green-200 p-4 rounded-md mb-6">
        <div className="flex items-center gap-3">
          <Image src="/result.png" alt="" width={20} height={20} />
          <div>
            <h3 className="font-medium text-green-800">Event Reporting </h3>

            
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default EventReportListPage;
