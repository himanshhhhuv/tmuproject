"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createEventReport, updateEventReport } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { eventReportSchema, EventReportSchema } from "@/lib/formValidationSchemas";

type Inputs = EventReportSchema;

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
    resolver: zodResolver(eventReportSchema),
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
        <InputField
          label="Total Participants"
          name="totalParticipants"
          defaultValue={data?.totalParticipants}
          register={register}
          error={errors?.totalParticipants}
          type="number"
        />

        {relatedData?.events && (
          <div className="flex flex-col gap-2 w-full md:w-1/3">
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

      <input type="hidden" name="reportType" value="SUMMARY" />
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
