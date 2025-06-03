"use client";

import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = ({
  type,
  id,
  lessons = [],
}: {
  type: "teacherId" | "classId";
  id: string | number;
  lessons?: { name: string; startTime: Date; endTime: Date }[];
}) => {
  const data = (lessons || []).map((lesson) => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
