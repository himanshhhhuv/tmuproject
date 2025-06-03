"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { createEventDocument, updateEventDocument } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().optional(),
  eventId: z.coerce.number().min(1, { message: "Event is required!" }),
  file: z.any().optional(),
});

type Inputs = z.infer<typeof schema>;

const EventDocumentForm = ({
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
    type === "create" ? createEventDocument : updateEventDocument,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event document has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" action={formAction}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event document" : "Update the event document"}
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
        {relatedData?.events && (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs text-gray-500">Event</label>
            <select
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              {...register("eventId")}
              defaultValue={data?.eventId}
            >
              <option value="">Select an event</option>
              {relatedData.events.map((event: { id: number; title: string }) => (
                <option value={event.id} key={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
            {errors.eventId?.message && (
              <p className="text-xs text-red-400">
                {errors.eventId.message.toString()}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">
            {type === "create" ? "Upload File" : "Replace File (optional)"}
          </label>
          <input
            type="file"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("file")}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          />
          {errors.file?.message && (
            <p className="text-xs text-red-400">
              {errors.file.message.toString()}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Accepted formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 5MB)
          </p>
        </div>
      </div>

      {data?.fileUrl && (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Current File</label>
          <a
            href={data.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm"
          >
            {data.fileName || "Download Current File"}
          </a>
        </div>
      )}

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

      <input type="hidden" name="uploadedBy" value="current-user-id" />

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventDocumentForm;
