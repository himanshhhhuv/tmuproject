"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createEventReport, updateEventReport } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().optional(),
  reportType: z.enum(
    ["ATTENDANCE", "BUDGET", "FEEDBACK", "INCIDENT", "SUMMARY", "LOGISTICS"],
    {
      message: "Report type is required!",
    }
  ),
  eventId: z.coerce.number().min(1, { message: "Event is required!" }),
});

type Inputs = z.infer<typeof schema>;

const EventReportForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEventReport : updateEventReport,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Event report has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const reportTypes = [
    { value: "ATTENDANCE", label: "Attendance Report" },
    { value: "BUDGET", label: "Budget Report" },
    { value: "FEEDBACK", label: "Feedback Report" },
    { value: "INCIDENT", label: "Incident Report" },
    { value: "SUMMARY", label: "Summary Report" },
    { value: "LOGISTICS", label: "Logistics Report" },
  ];

  return (
    <form className="flex flex-col gap-8" action={formAction}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new event report"
          : "Update the event report"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          type="textarea"
        />
      </div>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Report Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("reportType")}
            defaultValue={data?.reportType}
          >
            <option value="">Select report type</option>
            {reportTypes.map((type) => (
              <option value={type.value} key={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.reportType?.message && (
            <p className="text-xs text-red-400">
              {errors.reportType.message.toString()}
            </p>
          )}
        </div>

        {relatedData?.events && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Event</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("eventId")}
              defaultValue={data?.eventId}
            >
              <option value="">Select an event</option>
              {relatedData.events.map(
                (event: { id: number; title: string }) => (
                  <option value={event.id} key={event.id}>
                    {event.title}
                  </option>
                )
              )}
            </select>
            {errors.eventId?.message && (
              <p className="text-xs text-red-400">
                {errors.eventId.message.toString()}
              </p>
            )}
          </div>
        )}
      </div>

      {data && (
        <InputField
          label="Id"
          name="id"
          defaultValue={data?.id}
          register={register}
          error={errors?.id}
          hidden
        />
      )}

      <input type="hidden" name="createdBy" value="current-user-id" />

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventReportForm;
