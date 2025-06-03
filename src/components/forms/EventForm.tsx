"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";

// Define the schema for event form validation
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

// Dummy actions, replace with your actual create/update event actions
import { createEvent, updateEvent } from "@/lib/actions";

const EventForm = ({
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
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      location: data?.location || "",
      date: data?.startTime
        ? (typeof data.startTime === "string"
            ? data.startTime
            : data.startTime.toISOString()
          ).split("T")[0]
        : "",
      startTime: data?.startTime
        ? (typeof data.startTime === "string"
            ? data.startTime
            : data.startTime.toISOString()
          )
            .split("T")[1]
            ?.slice(0, 5)
        : "",
      endTime: data?.endTime
        ? (typeof data.endTime === "string"
            ? data.endTime
            : data.endTime.toISOString()
          )
            .split("T")[1]
            ?.slice(0, 5)
        : "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;

  const onSubmit = handleSubmit((formData) => {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    // Combine date and time for startTime and endTime
    fd.append(
      "startTime",
      new Date(`${formData.date}T${formData.startTime}`).toISOString()
    );
    fd.append(
      "endTime",
      new Date(`${formData.date}T${formData.endTime}`).toISOString()
    );
    if (data && data.id) {
      fd.append("id", data.id.toString());
    }
    // Add approval fields for create
    if (type === "create") {
      fd.append("approvalStatus", "PENDING");
      if (user?.id) {
        fd.append("submittedBy", user.id);
      }
    }
    formAction(fd);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
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
        />
        {/* <InputField
          label="Location"
          name="location"
          defaultValue={data?.location}
          register={register}
          error={errors?.location}
        /> */}
        <InputField
          label="Date"
          name="date"
          type="date"
          register={register}
          error={errors?.date}
        />
        <InputField
          label="Start Time"
          name="startTime"
          type="time"
          register={register}
          error={errors?.startTime}
        />
        <InputField
          label="End Time"
          name="endTime"
          type="time"
          register={register}
          error={errors?.endTime}
        />
        {data && data.id && <input type="hidden" name="id" value={data.id} />}
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create"
          ? role === "hod" || role === "teacher"
            ? "Submit for Approval"
            : "Create Event"
          : "Update"}
      </button>
    </form>
  );
};

export default EventForm;
