"use client";

import { createAttendance, updateAttendance } from "@/lib/actions";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AttendanceForm = ({ type, data, setOpen, relatedData }: any) => {
  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Attendance ${type}d successfully!`);
      setOpen(false);
      router.refresh();
    }
    if (state.error) {
      toast.error("Something went wrong!");
    }
  }, [state, router, setOpen, type]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="text" name="id" value={data?.id} hidden />
      
      <div className="flex flex-col gap-2">
        <label>Student</label>
        <select 
          name="studentId" 
          defaultValue={data?.studentId || ""}
          className="p-2 border rounded-md"
          required
        >
          <option value="">Select Student</option>
          {relatedData?.students?.map((student: any) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label>Lesson</label>
        <select 
          name="lessonId" 
          defaultValue={data?.lessonId || ""}
          className="p-2 border rounded-md"
          required
        >
          <option value="">Select Lesson</option>
          {relatedData?.lessons?.map((lesson: any) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label>Date</label>
        <input
          type="date"
          name="date"
          defaultValue={
            (data?.date instanceof Date 
              ? data.date.toISOString()
              : data?.date)?.split('T')[0] || 
            new Date().toISOString().split('T')[0]
          }
          className="p-2 border rounded-md"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label>Status</label>
        <select 
          name="present" 
          defaultValue={data?.present?.toString() || "true"}
          className="p-2 border rounded-md"
          required
        >
          <option value="true">Present</option>
          <option value="false">Absent</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-lamaGreen text-white p-2 rounded-md self-end"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm; 