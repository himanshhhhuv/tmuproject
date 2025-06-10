import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { EventDocument, Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";

type EventDocumentList = EventDocument & {
  event: {
    id: number;
    title: string;
  };
};

const EventDocumentListPage = async ({
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
      header: "Document",
      accessor: "title",
    },
    {
      header: "Event",
      accessor: "event",
      className: "hidden md:table-cell",
    },
    {
      header: "File Type",
      accessor: "fileType",
      className: "hidden md:table-cell",
    },
    {
      header: "Size",
      accessor: "fileSize",
      className: "hidden lg:table-cell",
    },
    {
      header: "Uploaded",
      accessor: "uploadedAt",
      className: "hidden lg:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: EventDocumentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded">
            <Image src="/calendar.png" alt="" width={20} height={20} />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-xs text-gray-500">{item.fileName}</p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell p-4">
        <p className="text-sm">{item.event.title}</p>
      </td>
      <td className="hidden md:table-cell p-4">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {item.fileType.split('/').pop()?.toUpperCase()}
        </span>
      </td>
      <td className="hidden lg:table-cell p-4">
        {(item.fileSize / 1024 / 1024).toFixed(2)} MB
      </td>
      <td className="hidden lg:table-cell p-4">
        {new Intl.DateTimeFormat("en-US").format(item.uploadedAt)}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          <a href={item.fileUrl} download>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/upload.png" alt="" width={16} height={16} />
            </button>
          </a>
          {(role === "admin" || role === "principal" || role === "hod" || role === "teacher") && (
            <FormContainer table="eventDocument" type="update" data={item} />
          )}
          {(role === "admin" || role === "principal") && (
            <FormContainer table="eventDocument" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const query: Prisma.EventDocumentWhereInput = {};

  if (queryParams?.search) {
    query.OR = [
      { title: { contains: queryParams.search, mode: "insensitive" } },
      { fileName: { contains: queryParams.search, mode: "insensitive" } },
      { event: { title: { contains: queryParams.search, mode: "insensitive" } } },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.eventDocument.findMany({
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
        uploadedAt: "desc",
      },
    }),
    prisma.eventDocument.count({ where: query }),
  ]);

  // Get events for the form (only approved events)
  const events = await prisma.event.findMany({
    where: {
      approvalStatus: 'APPROVED'
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  // Get file type statistics
  const fileTypeStats = await prisma.eventDocument.groupBy({
    by: ['fileType'],
    _count: {
      fileType: true,
    },
  });

  const totalSize = await prisma.eventDocument.aggregate({
    _sum: {
      fileSize: true,
    },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Event Documents</h1>
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
              <FormContainer table="eventDocument" type="create" data={{ events }} />
            )}
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Total Documents</h3>
          <p className="text-2xl font-bold text-blue-600">{count}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Total Size</h3>
          <p className="text-2xl font-bold text-green-600">
            {totalSize._sum.fileSize ? (totalSize._sum.fileSize / 1024 / 1024 / 1024).toFixed(2) : '0'} GB
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">File Types</h3>
          <p className="text-2xl font-bold text-purple-600">{fileTypeStats.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-600">Recent Uploads</h3>
          <p className="text-2xl font-bold text-orange-600">
            {data.filter(doc => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return doc.uploadedAt > weekAgo;
            }).length}
          </p>
        </div>
      </div>

      {/* FILE TYPE BREAKDOWN */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Image src="/calendar.png" alt="" width={20} height={20} />
          <h3 className="font-medium text-gray-800">File Types Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {fileTypeStats.map((stat) => (
            <div key={stat.fileType} className="bg-white p-2 rounded text-center">
              <p className="text-xs font-medium text-gray-600">{stat.fileType.split('/').pop()?.toUpperCase()}</p>
              <p className="text-lg font-bold text-gray-800">{stat._count.fileType}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE NOTICE */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
        <div className="flex items-center gap-3">
          <Image src="/upload.png" alt="" width={20} height={20} />
          <div>
            <h3 className="font-medium text-blue-800">Document Management</h3>
            <p className="text-sm text-blue-600">
             
            </p>
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

export default EventDocumentListPage;
